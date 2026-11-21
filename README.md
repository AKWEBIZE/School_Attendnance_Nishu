# School App (Angular + Node.js + MySQL)

Screens: Login (logo, school name, forgot password, new login) → Teacher dashboard
(name, date, class, profile icon; tiles: Attendance, Events, Circular, Add students) →
Attendance (class, total students, Present / Absent / Late per student).

```
backend/   Node.js Express API (server.js, schema.sql, .env.example)
frontend/  Angular 19 app
```

## Run locally
1. Create a local MySQL database and import `backend/schema.sql`.
2. `cd backend` → copy `.env.example` to `.env`, fill DB values → `npm install` → `npm start` (port 3000).
3. `cd frontend` → `npm install` → `npx ng serve` → open http://localhost:4200
4. Click **New login** to create a teacher, then log in. Add students, then take attendance.

## Deploy on Hostinger (Business plan)

### 1. MySQL
hPanel → **Databases → MySQL Databases** → create DB + user (note name, user, password).
Open **phpMyAdmin** → select DB → **Import** → `backend/schema.sql`.
Edit the `school` row to set your school name and logo URL.

### 2. Backend (Node.js)
hPanel → **Websites → Add website → Node.js app** (or "Node.js" under Advanced), e.g. on `api.yourdomain.com`.
- Upload the `backend` folder (without `node_modules`), entry file `server.js`.
- Set environment variables from `.env.example` (DB_HOST is usually `localhost`;
  `CORS_ORIGIN` = your frontend URL; `JWT_SECRET` = long random string).
- Run install / start from the panel. Test `https://api.yourdomain.com/api/health` → `{"ok":true}`.

> If your plan doesn't show a Node.js app option, the API needs a Hostinger VPS (run with `pm2`).

### 3. Frontend (Angular)
- Set `apiUrl` in `frontend/src/environments/environment.ts` to `https://api.yourdomain.com/api`.
- `cd frontend && npx ng build`
- Upload the **contents** of `frontend/dist/frontend/browser/` (includes `.htaccess`) to `public_html`
  of the domain/subdomain for the app.

## To do before going live
- Forgot password currently logs the reset token on the server; hook it to email
  (Hostinger SMTP + nodemailer) sending `https://yourapp/forgot?token=...`.
- "New login" lets anyone register as a teacher — add admin approval if needed.
