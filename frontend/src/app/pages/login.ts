import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="wrap">
    <aside class="brand">
      <div class="brand-inner">
        <div class="logo">
          @if (school.logo_url) { <img [src]="school.logo_url" alt="Logo" /> } @else { <span>🎓</span> }
        </div>
        <h1>{{ school.name }}</h1>
        <p>Attendance, events and circulars for teachers, all in one place.</p>
      </div>
    </aside>

    <main class="form-side">
      <form class="box" (ngSubmit)="login()">
        <div class="mobile-logo">
          @if (school.logo_url) { <img [src]="school.logo_url" alt="Logo" /> } @else { <span>🎓</span> }
          <b>{{ school.name }}</b>
        </div>
        <h2>Welcome back</h2>
        <p class="muted">Sign in to your teacher account</p>

        <label for="u">Username</label>
        <input id="u" name="username" [(ngModel)]="username" placeholder="Enter your username" required autocomplete="username" />

        <label for="p">Password</label>
        <div class="pw">
          <input id="p" name="password" [(ngModel)]="password" [type]="show ? 'text' : 'password'" placeholder="Enter your password" required autocomplete="current-password" />
          <button type="button" class="eye" (click)="show = !show">{{ show ? 'Hide' : 'Show' }}</button>
        </div>

        <div class="row-end"><a routerLink="/forgot">Forgot password?</a></div>
        @if (error) { <p class="error">{{ error }}</p> }
        <button class="primary block" [disabled]="busy || !username || !password">{{ busy ? 'Signing in...' : 'Login' }}</button>

        <p class="center muted new">New teacher? <a routerLink="/register">New login</a></p>
      </form>
    </main>
  </div>`,
  styles: [`
    .wrap{display:grid;grid-template-columns:1fr 1fr;min-height:100vh}
    .brand{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#db2777 100%);color:#fff;display:flex;align-items:center;justify-content:center;padding:40px}
    .brand-inner{max-width:420px;text-align:center}
    .brand h1{font-size:34px;margin:20px 0 10px}
    .brand p{opacity:.85;font-size:16px;line-height:1.6}
    .logo{width:120px;height:120px;margin:0 auto;border-radius:28px;background:rgba(255,255,255,.18);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;font-size:56px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.15)}
    .logo img{width:100%;height:100%;object-fit:cover}
    .form-side{display:flex;align-items:center;justify-content:center;padding:32px 20px}
    .box{width:100%;max-width:400px;animation:fadeIn .3s ease}
    .box h2{font-size:28px;margin-bottom:4px}
    .box .muted{margin:0 0 16px}
    .pw{position:relative}
    .pw input{padding-right:64px}
    .eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:none;color:var(--primary);font-weight:600;cursor:pointer;padding:6px}
    .row-end{text-align:right;margin:6px 0 16px;font-size:14px}
    .new{margin-top:28px}
    .mobile-logo{display:none}
    @media (max-width:800px){
      .wrap{grid-template-columns:1fr}
      .brand{display:none}
      .mobile-logo{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:24px;font-size:18px}
      .mobile-logo span,.mobile-logo img{width:84px;height:84px;border-radius:22px;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:40px;object-fit:cover}
    }`]
})
export class LoginPage {
  private api = inject(Api);
  private router = inject(Router);
  school: any = { name: 'School Name', logo_url: null };
  username = ''; password = ''; error = ''; busy = false; show = false;

  constructor() { this.api.get('/school').subscribe({ next: s => this.school = s, error: () => {} }); }

  login() {
    this.error = ''; this.busy = true;
    this.api.post('/auth/login', { username: this.username, password: this.password }).subscribe({
      next: r => { localStorage.setItem('token', r.token); this.router.navigate(['/']); },
      error: e => { this.error = e.error?.message || 'Login failed'; this.busy = false; }
    });
  }
}
