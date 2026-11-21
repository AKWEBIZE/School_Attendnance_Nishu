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
    <div class="topbar"><a class="back" routerLink="/">←</a><h2 style="margin:0">Circulars</h2></div>
    <form (ngSubmit)="add()" class="card">
      <input name="title" [(ngModel)]="f.title" placeholder="Title" required />
      <textarea name="body" [(ngModel)]="f.body" placeholder="Message" rows="4" required></textarea>
      @if (error) { <p class="error">{{ error }}</p> }
      <button class="primary">Publish circular</button>
    </form>
    @for (c of list; track c.id) {
      <div class="card"><b>{{ c.title }}</b> <small>{{ c.created_at | date:'medium' }}</small><p>{{ c.body }}</p></div>
    } @empty { <p>No circulars yet.</p> }
  </div>`
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
