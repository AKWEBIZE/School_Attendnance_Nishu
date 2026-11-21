import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../api.service';
import { loadClasses } from './classpick';

@Component({
  selector: 'app-students',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="topbar"><a class="back" routerLink="/">←</a><h2 style="margin:0">Add students</h2></div>
    <select [(ngModel)]="classId" (ngModelChange)="onClass()">
      <option [ngValue]="null">Select class</option>
      @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
    </select>
    @if (classId) {
      <form (ngSubmit)="add()" class="card">
        <input name="name" [(ngModel)]="f.name" placeholder="Student name" required />
        <input name="roll" [(ngModel)]="f.roll_no" placeholder="Roll no" />
        <input name="phone" [(ngModel)]="f.parent_phone" placeholder="Parent phone" />
        @if (error) { <p class="error">{{ error }}</p> }
        <button class="primary">Add student</button>
      </form>
      <h3>Students ({{ list.length }})</h3>
      @for (s of list; track s.id) {
        <div class="card item"><span>{{ s.roll_no }} {{ s.name }}</span><a (click)="remove(s)">Remove</a></div>
      }
    }
  </div>`,
  styles: [`.item{display:flex;justify-content:space-between}`]
})
export class StudentsPage {
  private api = inject(Api);
  classes: any[] = []; classId: number | null = null; list: any[] = []; error = '';
  f: any = { name: '', roll_no: '', parent_phone: '' };
  constructor() { loadClasses(this); }
  onClass() { if (this.classId) this.api.get<any[]>('/students', { class_id: this.classId }).subscribe(l => this.list = l); }
  add() {
    this.error = '';
    this.api.post('/students', { ...this.f, class_id: this.classId }).subscribe({
      next: () => { this.f = { name: '', roll_no: '', parent_phone: '' }; this.onClass(); },
      error: e => this.error = e.error?.message || 'Error'
    });
  }
  remove(s: any) { if (confirm(`Remove ${s.name}?`)) this.api.delete('/students/' + s.id).subscribe(() => this.onClass()); }
}
