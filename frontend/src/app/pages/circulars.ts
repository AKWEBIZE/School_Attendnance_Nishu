import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../api.service';

@Component({
  selector: 'app-circulars',
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
  <div class="page">
    <div class="topbar"><a class="back" routerLink="/">←</a><h2>Circulars</h2></div>
    <div class="grid-2">
      <form (ngSubmit)="add()" class="card">
        <h3 style="margin-top:0">New circular</h3>
        <label>Title</label><input name="title" [(ngModel)]="f.title" placeholder="e.g. Holiday notice" required />
        <label>Message</label><textarea name="body" [(ngModel)]="f.body" placeholder="Write the notice..." rows="6" required></textarea>
        @if (error) { <p class="error">{{ error }}</p> }
        <button class="primary block" [disabled]="!f.title || !f.body">📢 Publish circular</button>
      </form>
      <div>
        @for (c of list; track c.id) {
          <div class="card circ">
            <div class="head"><b>{{ c.title }}</b><small class="muted">{{ c.created_at | date:'d MMM y, h:mm a' }}</small></div>
            <p>{{ c.body }}</p>
          </div>
        } @empty { <div class="card muted center">No circulars yet.</div> }
      </div>
    </div>
  </div>`,
  styles: [`
    .block{margin-top:12px}
    .circ{margin-top:0;margin-bottom:12px;border-left:4px solid #db2777;animation:fadeIn .2s ease}
    .head{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
    .circ p{margin:8px 0 0;white-space:pre-line}`]
})
export class CircularsPage {
  private api = inject(Api);
  list: any[] = []; error = ''; f: any = { title: '', body: '' };
  constructor() { this.load(); }
  load() { this.api.get<any[]>('/circulars').subscribe(l => this.list = l); }
  add() {
    this.error = '';
    this.api.post('/circulars', this.f).subscribe({
      next: () => { this.f = { title: '', body: '' }; this.load(); },
      error: e => this.error = e.error?.message || 'Error' });
  }
}
