import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../api.service';
import { loadClasses } from './classpick';

@Component({
  selector: 'app-attendance',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="topbar"><a class="back" routerLink="/">←</a><h2 style="margin:0">Attendance</h2></div>
    <div class="row">
      <select [(ngModel)]="classId" (ngModelChange)="onClass()">
        <option [ngValue]="null">Class</option>
        @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
      </select>
      <input type="date" [(ngModel)]="date" (ngModelChange)="onClass()" />
    </div>
    <p><b>Total students: {{ rows.length }}</b>
      &nbsp; P {{ count('present') }} · A {{ count('absent') }} · L {{ count('late') }}</p>
    <table>
      <tr><th>Name</th><th>Present</th><th>Absent</th><th>Late</th></tr>
      @for (r of rows; track r.student_id) {
        <tr>
          <td>{{ r.name }}</td>
          <td><input type="radio" [name]="'s' + r.student_id" value="present" [(ngModel)]="r.status" /></td>
          <td><input type="radio" [name]="'s' + r.student_id" value="absent" [(ngModel)]="r.status" /></td>
          <td><input type="radio" [name]="'s' + r.student_id" value="late" [(ngModel)]="r.status" /></td>
        </tr>
      } @empty { <tr><td colspan="4">No students in this class</td></tr> }
    </table>
    @if (rows.length) {
      <p class="center">
        <a (click)="allPresent()">Mark all present</a><br /><br />
        <button class="primary" (click)="save()">Save attendance</button>
      </p>
    }
    @if (msg) { <p class="ok center">{{ msg }}</p> }
  </div>`,
  styles: [`.row{display:flex;gap:8px} input[type=radio]{width:20px;height:20px;margin:0}`]
})
export class AttendancePage {
  private api = inject(Api);
  classes: any[] = []; classId: number | null = null; rows: any[] = []; msg = '';
  date = new Date().toISOString().slice(0, 10);
  constructor() { loadClasses(this); }
  onClass() {
    this.msg = '';
    if (!this.classId) { this.rows = []; return; }
    this.api.get<any[]>('/attendance', { class_id: this.classId, date: this.date }).subscribe(r => this.rows = r);
  }
  count(s: string) { return this.rows.filter(r => r.status === s).length; }
  allPresent() { this.rows.forEach(r => r.status = 'present'); }
  save() {
    const records = this.rows.map(r => ({ student_id: r.student_id, status: r.status }));
    this.api.post('/attendance', { date: this.date, records }).subscribe(r => this.msg = `Saved ${r.saved} records`);
  }
}
