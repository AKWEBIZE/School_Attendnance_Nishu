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
    <div class="topbar"><a class="back" routerLink="/">←</a><h2 style="margin:0">Events</h2></div>
    <form (ngSubmit)="add()" class="card">
      <input name="title" [(ngModel)]="f.title" placeholder="Event title" required />
      <input name="date" type="date" [(ngModel)]="f.event_date" required />
      <textarea name="desc" [(ngModel)]="f.description" placeholder="Description" rows="3"></textarea>
      @if (error) { <p class="error">{{ error }}</p> }
      <button class="primary">Add event</button>
    </form>
    @for (e of list; track e.id) {
      <div class="card"><b>{{ e.title }}</b> - {{ e.event_date | date:'mediumDate' }}<div>{{ e.description }}</div></div>
    } @empty { <p>No events yet.</p> }
  </div>`
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
