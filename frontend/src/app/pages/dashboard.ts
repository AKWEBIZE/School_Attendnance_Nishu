import { Component, HostListener, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../api.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  template: `
  <div class="page">
    <header class="hero">
      <div>
        <p class="greet">{{ greeting }},</p>
        <h1>{{ me?.name || '...' }}</h1>
        <div class="chips">
          <span class="chip">📅 {{ today | date:'EEEE, d MMMM y' }}</span>
          <span class="chip">🏫 Class {{ me?.class_name || '-' }}</span>
        </div>
      </div>
      <div class="profile" (click)="$event.stopPropagation()">
        <button class="avatar" (click)="menu = !menu" title="Profile">
          @if (me?.photo_url) { <img [src]="me.photo_url" alt="" /> } @else { {{ initial }} }
        </button>
        @if (menu) {
          <div class="menu">
            <div class="menu-head"><b>{{ me?.name }}</b><small>&#64;{{ me?.username }}</small></div>
            <button class="menu-item" (click)="logout()">🚪 Logout</button>
          </div>
        }
      </div>
    </header>

    @if (me?.class_id) {
      <section class="stats">
        <div class="stat"><span>Students</span><b>{{ stats.total }}</b></div>
        <div class="stat green"><span>Present today</span><b>{{ stats.present }}</b></div>
        <div class="stat red"><span>Absent today</span><b>{{ stats.absent }}</b></div>
        <div class="stat amber"><span>Late today</span><b>{{ stats.late }}</b></div>
      </section>
    }

    <h3>Quick actions</h3>
    <section class="tiles">
      @for (t of tiles; track t.link) {
        <a class="tile" [routerLink]="t.link" [style.--c]="t.color">
          <div class="ico">{{ t.icon }}</div>
          <div class="txt"><b>{{ t.title }}</b><small>{{ t.desc }}</small></div>
          <span class="arrow">→</span>
        </a>
      }
    </section>
  </div>`,
  styles: [`
    .hero{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:28px;border-radius:20px;color:#fff;
      background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#db2777 100%);box-shadow:0 12px 30px rgba(79,70,229,.25)}
    .greet{margin:0;opacity:.85}
    .hero h1{font-size:30px;margin:2px 0 14px}
    .chips{display:flex;flex-wrap:wrap;gap:8px}
    .chip{background:rgba(255,255,255,.18);padding:6px 12px;border-radius:999px;font-size:14px}
    .profile{position:relative}
    .avatar{width:56px;height:56px;border-radius:50%;border:3px solid rgba(255,255,255,.7);background:rgba(255,255,255,.2);color:#fff;font-size:22px;font-weight:700;cursor:pointer;overflow:hidden;padding:0;transition:transform .15s}
    .avatar:hover{transform:scale(1.05)}
    .avatar img{width:100%;height:100%;object-fit:cover}
    .menu{position:absolute;right:0;top:64px;background:#fff;color:var(--text);border-radius:12px;min-width:200px;box-shadow:0 12px 30px rgba(15,23,42,.18);z-index:5;overflow:hidden;animation:fadeIn .15s ease}
    .menu-head{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;flex-direction:column}
    .menu-head small{color:var(--muted)}
    .menu-item{width:100%;text-align:left;padding:12px 16px;border:0;background:none;cursor:pointer;font-size:15px}
    .menu-item:hover{background:var(--primary-soft)}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px}
    .stat{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:4px}
    .stat span{color:var(--muted);font-size:13px}
    .stat b{font-size:26px}
    .stat.green b{color:var(--green)} .stat.red b{color:var(--red)} .stat.amber b{color:var(--amber)}
    h3{margin-top:28px}
    .tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
    .tile{display:flex;align-items:center;gap:16px;padding:20px;background:#fff;border:1px solid var(--border);border-radius:16px;color:var(--text);
      box-shadow:var(--shadow);transition:transform .15s,box-shadow .15s,border-color .15s;text-decoration:none}
    .tile:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(15,23,42,.1);border-color:var(--c);text-decoration:none}
    .ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;
      background:color-mix(in srgb,var(--c) 14%,white)}
    .txt{display:flex;flex-direction:column;gap:2px;flex:1}
    .txt b{font-size:17px}
    .txt small{color:var(--muted);font-weight:400}
    .arrow{color:var(--c);font-size:20px;transition:transform .15s}
    .tile:hover .arrow{transform:translateX(4px)}
    @media (max-width:800px){ .stats{grid-template-columns:repeat(2,1fr)} }
    @media (max-width:600px){ .tiles{grid-template-columns:1fr} .hero{padding:20px} .hero h1{font-size:24px} }`]
})
export class DashboardPage {
  private api = inject(Api);
  private router = inject(Router);
  me: any; today = new Date(); menu = false;
  stats = { total: 0, present: 0, absent: 0, late: 0 };
  tiles = [
    { link: '/attendance', icon: '📋', title: 'Attendance', desc: 'Mark present, absent or late', color: '#4f46e5' },
    { link: '/events', icon: '📅', title: 'Events', desc: 'Plan and view school events', color: '#0891b2' },
    { link: '/circulars', icon: '📢', title: 'Circular', desc: 'Share notices with everyone', color: '#db2777' },
    { link: '/students', icon: '🧑‍🎓', title: 'Add students', desc: 'Manage your class list', color: '#16a34a' },
  ];

  get greeting() { const h = this.today.getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
  get initial() { return (this.me?.name || '?')[0].toUpperCase(); }

  constructor() {
    this.api.get('/me').subscribe({ next: m => { this.me = m; this.loadStats(); }, error: () => this.logout() });
  }

  loadStats() {
    if (!this.me?.class_id) return;
    const d = new Date(); const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.api.get<any[]>('/attendance', { class_id: this.me.class_id, date }).subscribe(rows => {
      this.stats = {
        total: rows.length,
        present: rows.filter(r => r.status === 'present').length,
        absent: rows.filter(r => r.status === 'absent').length,
        late: rows.filter(r => r.status === 'late').length,
      };
    });
  }

  @HostListener('document:click') close() { this.menu = false; }
  logout() { localStorage.removeItem('token'); this.router.navigate(['/login']); }
}
