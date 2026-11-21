import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../api.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  template: `
  <div class="page">
    <div class="head">
      <div>
        <div class="name">{{ me?.name }}</div>
        <div>{{ today | date:'fullDate' }}</div>
        <div>Class: {{ me?.class_name || '-' }}</div>
      </div>
      <button class="avatar" (click)="menu = !menu" title="Profile">
        @if (me?.photo_url) { <img [src]="me.photo_url" alt="" /> } @else { {{ me?.name?.[0] }} }
      </button>
      @if (menu) {
        <div class="menu"><div>{{ me?.username }}</div><a (click)="logout()">Logout</a></div>
      }
    </div>
    <div class="grid">
      <a class="tile" routerLink="/attendance">📋<span>Attendance</span></a>
      <a class="tile" routerLink="/events">📅<span>Events</span></a>
      <a class="tile" routerLink="/circulars">📢<span>Circular</span></a>
      <a class="tile" routerLink="/students">➕<span>Add students</span></a>
    </div>
  </div>`,
  styles: [`
    .head{display:flex;justify-content:space-between;align-items:flex-start;position:relative;margin-bottom:24px;line-height:1.6}
    .name{font-size:20px;font-weight:600}
    .avatar{width:52px;height:52px;border-radius:50%;border:2px solid #2563eb;background:#eff6ff;font-size:22px;font-weight:600;color:#2563eb;cursor:pointer;overflow:hidden;padding:0}
    .avatar img{width:100%;height:100%;object-fit:cover}
    .menu{position:absolute;right:0;top:58px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;box-shadow:0 4px 12px #0001;z-index:2}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;height:120px;border:1px solid #cbd5e1;border-radius:12px;font-size:32px;color:#0f172a}
    .tile span{font-size:15px;font-weight:500}
    .tile:hover{background:#f8fafc}`]
})
export class DashboardPage {
  private api = inject(Api);
  private router = inject(Router);
  me: any; today = new Date(); menu = false;
  constructor() {
    this.api.get('/me').subscribe({ next: m => this.me = m, error: () => this.logout() });
  }
  logout() { localStorage.removeItem('token'); this.router.navigate(['/login']); }
}
