import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../api.service';

@Component({
  selector: 'app-events',
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
  <div class="page">
    <div class="topbar"><a class="back" routerLink="/">←</a><h2>Events</h2></div>
    <div class="grid-2">
      <form (ngSubmit)="add()" class="card">
        <h3 style="margin-top:0">New event</h3>
        <label>Title</label><input name="title" [(ngModel)]="f.title" placeholder="e.g. Sports Day" required />
        <label>Date</label><input name="date" type="date" [(ngModel)]="f.event_date" required />
        <label>Description</label><textarea name="desc" [(ngModel)]="f.description" placeholder="Details for teachers and parents" rows="4"></textarea>
        @if (error) { <p class="error">{{ error }}</p> }
        <button class="primary block" [disabled]="!f.title || !f.event_date">+ Add event</button>
      </form>
      <div>
        @for (e of list; track e.id) {
          <div class="card ev">
            <div class="date"><b>{{ e.event_date | date:'d' }}</b><span>{{ e.event_date | date:'MMM' }}</span></div>
            <div><b>{{ e.title }}</b><p class="muted">{{ e.description }}</p></div>
          </div>
        } @empty { <div class="card muted center">No events yet.</div> }
      </div>
    </div>
  </div>`,
  styles: [`
    .block{margin-top:12px}
    .ev{display:flex;gap:16px;align-items:flex-start;margin-top:0;margin-bottom:12px;animation:fadeIn .2s ease}
    .ev p{margin:4px 0 0}
    .date{min-width:58px;border-radius:12px;background:#ecfeff;color:#0891b2;display:flex;flex-direction:column;align-items:center;padding:8px}
    .date b{font-size:22px;line-height:1} .date span{font-size:12px;text-transform:uppercase;font-weight:600}`]
})
export class EventsPage {
  private api = inject(Api);
  list: any[] = []; error = ''; f: any = { title: '', event_date: '', description: '' };
  constructor() { this.load(); }
  load() { this.api.get<any[]>('/events').subscribe(l => this.list = l); }
  add() {
    this.error = '';
    this.api.post('/events', this.f).subscribe({
      next: () => { this.f = { title: '', event_date: '', description: '' }; this.load(); },
      error: e => this.error = e.error?.message || 'Error' });
  }
}
