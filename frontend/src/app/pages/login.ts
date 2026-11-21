import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="page center">
    <div class="logo">
      @if (school.logo_url) { <img [src]="school.logo_url" alt="Logo" /> } @else { <span>LOGO</span> }
    </div>
    <h2>{{ school.name }}</h2>
    <form (ngSubmit)="login()">
      <input name="username" [(ngModel)]="username" placeholder="Username" required autocomplete="username" />
      <input name="password" [(ngModel)]="password" type="password" placeholder="Password" required autocomplete="current-password" />
      <div style="text-align:right"><a routerLink="/forgot">Forgot password?</a></div>
      @if (error) { <p class="error">{{ error }}</p> }
      <p><button class="primary" [disabled]="busy">{{ busy ? 'Signing in...' : 'Login' }}</button></p>
    </form>
    <p style="margin-top:40px"><a routerLink="/register">New login</a></p>
  </div>`,
  styles: [`.logo{width:110px;height:110px;margin:30px auto 10px;border:2px solid #cbd5e1;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#64748b;font-weight:600}
            .logo img{max-width:100%;max-height:100%}`]
})
export class LoginPage {
  private api = inject(Api);
  private router = inject(Router);
  school: any = { name: 'School Name', logo_url: null };
  username = ''; password = ''; error = ''; busy = false;

  constructor() { this.api.get('/school').subscribe({ next: s => this.school = s, error: () => {} }); }

  login() {
    this.error = ''; this.busy = true;
    this.api.post('/auth/login', { username: this.username, password: this.password }).subscribe({
      next: r => { localStorage.setItem('token', r.token); this.router.navigate(['/']); },
      error: e => { this.error = e.error?.message || 'Login failed'; this.busy = false; }
    });
  }
}
