require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

const app = express();
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json());

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// ---------- Public ----------
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/school', wrap(async (req, res) => {
  const [rows] = await db.query('SELECT name, logo_url FROM school WHERE id = 1');
  res.json(rows[0] || { name: 'School', logo_url: null });
}));

app.get('/api/classes', wrap(async (req, res) => {
  const [rows] = await db.query('SELECT id, name FROM classes ORDER BY name');
  res.json(rows);
}));

// "New login" = teacher registration
app.post('/api/auth/register', wrap(async (req, res) => {
  const { name, username, password, email, class_id } = req.body;
  if (!name || !username || !password) return res.status(400).json({ message: 'Name, username and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const [exists] = await db.query('SELECT id FROM teachers WHERE username = ?', [username]);
  if (exists.length) return res.status(409).json({ message: 'Username already taken' });
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO teachers (name, username, email, password_hash, class_id) VALUES (?,?,?,?,?)',
    [name, username, email || null, hash, class_id || null]
  );
  res.status(201).json({ message: 'Account created' });
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query('SELECT * FROM teachers WHERE username = ?', [username]);
  const t = rows[0];
  if (!t || !(await bcrypt.compare(password || '', t.password_hash))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const token = jwt.sign({ id: t.id, name: t.name, class_id: t.class_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
}));

// Forgot password: creates a reset token. Wire this to email (Hostinger SMTP) in production.
app.post('/api/auth/forgot', wrap(async (req, res) => {
  const { username } = req.body;
  const token = crypto.randomBytes(20).toString('hex');
  await db.query(
    'UPDATE teachers SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE username = ?',
    [token, username]
  );
  // TODO: email the link `${FRONTEND_URL}/reset?token=${token}` to the teacher.
  console.log(`Password reset token for ${username}: ${token}`);
  res.json({ message: 'If the account exists, reset instructions have been sent.' });
}));

app.post('/api/auth/reset', wrap(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) return res.status(400).json({ message: 'Invalid request' });
  const hash = await bcrypt.hash(password, 10);
  const [r] = await db.query(
    'UPDATE teachers SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ? AND reset_expires > NOW()',
    [hash, token]
  );
  if (!r.affectedRows) return res.status(400).json({ message: 'Reset link is invalid or expired' });
  res.json({ message: 'Password updated' });
}));

// ---------- Protected ----------
app.get('/api/me', auth, wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT t.id, t.name, t.username, t.email, t.photo_url, t.class_id, c.name AS class_name
     FROM teachers t LEFT JOIN classes c ON c.id = t.class_id WHERE t.id = ?`, [req.user.id]);
  res.json(rows[0]);
}));

// Students
app.get('/api/students', auth, wrap(async (req, res) => {
  const classId = req.query.class_id;
  const [rows] = await db.query(
    'SELECT id, name, roll_no, class_id, parent_phone FROM students WHERE class_id = ? ORDER BY roll_no, name', [classId]);
  res.json(rows);
}));

app.post('/api/students', auth, wrap(async (req, res) => {
  const { name, roll_no, class_id, parent_phone } = req.body;
  if (!name || !class_id) return res.status(400).json({ message: 'Name and class are required' });
  const [r] = await db.query('INSERT INTO students (name, roll_no, class_id, parent_phone) VALUES (?,?,?,?)',
    [name, roll_no || null, class_id, parent_phone || null]);
  res.status(201).json({ id: r.insertId });
}));

app.delete('/api/students/:id', auth, wrap(async (req, res) => {
  await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

// Attendance: get list for class+date, with any existing status
app.get('/api/attendance', auth, wrap(async (req, res) => {
  const { class_id, date } = req.query;
  const [rows] = await db.query(
    `SELECT s.id AS student_id, s.name, s.roll_no, a.status
     FROM students s LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
     WHERE s.class_id = ? ORDER BY s.roll_no, s.name`, [date, class_id]);
  res.json(rows);
}));

// Save attendance: { date, records: [{student_id, status}] }
app.post('/api/attendance', auth, wrap(async (req, res) => {
  const { date, records } = req.body;
  if (!date || !Array.isArray(records)) return res.status(400).json({ message: 'Invalid data' });
  const valid = records.filter((r) => ['present', 'absent', 'late'].includes(r.status));
  if (valid.length) {
    const values = valid.map((r) => [r.student_id, date, r.status, req.user.id]);
    await db.query(
      `INSERT INTO attendance (student_id, date, status, marked_by) VALUES ?
       ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)`, [values]);
  }
  res.json({ saved: valid.length });
}));

// Events
app.get('/api/events', auth, wrap(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM events ORDER BY event_date DESC');
  res.json(rows);
}));
app.post('/api/events', auth, wrap(async (req, res) => {
  const { title, description, event_date } = req.body;
  if (!title || !event_date) return res.status(400).json({ message: 'Title and date are required' });
  await db.query('INSERT INTO events (title, description, event_date, created_by) VALUES (?,?,?,?)',
    [title, description || null, event_date, req.user.id]);
  res.status(201).json({ ok: true });
}));

// Circulars
app.get('/api/circulars', auth, wrap(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM circulars ORDER BY created_at DESC');
  res.json(rows);
}));
app.post('/api/circulars', auth, wrap(async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'Title and message are required' });
  await db.query('INSERT INTO circulars (title, body, created_by) VALUES (?,?,?)', [title, body, req.user.id]);
  res.status(201).json({ ok: true });
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on port ${port}`));
