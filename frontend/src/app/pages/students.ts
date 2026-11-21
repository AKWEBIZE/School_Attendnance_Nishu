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
    <div class="topbar"><a class="back" routerLink="/">←</a><h2>Students</h2></div>
    <div class="grid-2">
      <form (ngSubmit)="add()" class="card">
        <h3 style="margin-top:0">Add a student</h3>
        <label>Class</label>
        <select name="cls" [(ngModel)]="classId" (ngModelChange)="onClass()">
          <option [ngValue]="null">Select class</option>
          @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
        </select>
        <label>Student name</label>
        <input name="name" [(ngModel)]="f.name" placeholder="e.g. Aarav Kumar" required />
        <div class="two">
          <div><label>Roll no</label><input name="roll" [(ngModel)]="f.roll_no" placeholder="01" /></div>
          <div><label>Parent phone</label><input name="phone" [(ngModel)]="f.parent_phone" placeholder="98765 43210" /></div>
        </div>
        @if (error) { <p class="error">{{ error }}</p> }
        @if (msg) { <p class="ok">{{ msg }}</p> }
        <button class="primary block" [disabled]="!classId || !f.name">+ Add student</button>
      </form>

      <div class="card">
        <div class="list-head">
          <h3 style="margin:0">Class list</h3><span class="badge">{{ list.length }}</span>
        </div>
        <input [(ngModel)]="q" placeholder="Search students" />
        @for (s of filtered; track s.id) {
          <div class="item">
            <div class="av">{{ s.name[0] }}</div>
            <div class="info"><b>{{ s.name }}</b><small>Roll {{ s.roll_no || '-' }} · {{ s.parent_phone || 'No phone' }}</small></div>
            <button class="del" (click)="remove(s)" title="Remove">✕</button>
          </div>
        } @empty { <p class="muted empty">{{ classId ? 'No students yet. Add the first one.' : 'Select a class to see its students.' }}</p> }
      </div>
    </div>
  </div>`,
  styles: [`
    .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .block{margin-top:14px}
    .list-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}
    .badge{background:var(--primary-soft);color:var(--primary);font-weight:700;border-radius:999px;padding:2px 10px;font-size:13px}
    .item{display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;transition:background .12s;animation:fadeIn .2s ease}
    .item:hover{background:#f8fafc}
    .av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;text-transform:uppercase}
    .info{flex:1;display:flex;flex-direction:column}
    .info small{color:var(--muted)}
    .del{border:0;background:none;color:var(--muted);width:32px;height:32px;border-radius:8px;cursor:pointer}
    .del:hover{background:var(--red-soft);color:var(--red)}
    .empty{text-align:center;padding:24px 0}`]
})
export class StudentsPage {
  private api = inject(Api);
  classes: any[] = []; classId: number | null = null; list: any[] = []; error = ''; msg = ''; q = '';
  f: any = { name: '', roll_no: '', parent_phone: '' };
  constructor() { loadClasses(this); }
  get filtered() { const q = this.q.trim().toLowerCase(); return q ? this.list.filter(s => s.name.toLowerCase().includes(q)) : this.list; }
  onClass() { this.list = []; if (this.classId) this.api.get<any[]>('/students', { class_id: this.classId }).subscribe(l => this.list = l); }
  add() {
    this.error = ''; this.msg = '';
    this.api.post('/students', { ...this.f, class_id: this.classId }).subscribe({
      next: () => { this.msg = `✓ ${this.f.name} added`; this.f = { name: '', roll_no: '', parent_phone: '' }; this.onClass(); },
      error: e => this.error = e.error?.message || 'Error'
    });
  }
  remove(s: any) { if (confirm(`Remove ${s.name}?`)) this.api.delete('/students/' + s.id).subscribe(() => this.onClass()); }
}
