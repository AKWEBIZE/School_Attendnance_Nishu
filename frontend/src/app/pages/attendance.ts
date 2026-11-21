import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../api.service';
import { loadClasses } from './classpick';

const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

@Component({
  selector: 'app-attendance',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="topbar"><a class="back" routerLink="/">←</a><h2>Attendance</h2></div>

    <div class="filters card">
      <div><label>Class</label>
        <select [(ngModel)]="classId" (ngModelChange)="onClass()">
          <option [ngValue]="null">Select class</option>
          @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
        </select>
      </div>
      <div><label>Date</label><input type="date" [(ngModel)]="date" (ngModelChange)="onClass()" /></div>
      <div><label>Search</label><input [(ngModel)]="q" placeholder="Student name" /></div>
    </div>

    <div class="summary">
      <div class="sum"><span>Total students</span><b>{{ rows.length }}</b></div>
      <div class="sum p"><span>Present</span><b>{{ count('present') }}</b></div>
      <div class="sum a"><span>Absent</span><b>{{ count('absent') }}</b></div>
      <div class="sum l"><span>Late</span><b>{{ count('late') }}</b></div>
      <div class="sum"><span>Not marked</span><b>{{ rows.length - marked }}</b></div>
    </div>
    @if (rows.length) {
      <div class="progress"><div [style.width.%]="rows.length ? marked * 100 / rows.length : 0"></div></div>
    }

    @if (rows.length) {
      <div class="actions">
        <button class="ghost" (click)="setAll('present')">✓ Mark all present</button>
        <button class="ghost" (click)="setAll(null)">Clear</button>
      </div>
    }

    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Status</th></tr></thead>
        <tbody>
          @for (r of filtered; track r.student_id; let i = $index) {
            <tr>
              <td class="muted">{{ r.roll_no || i + 1 }}</td>
              <td class="name">{{ r.name }}</td>
              <td>
                <div class="seg">
                  <button [class.on]="r.status === 'present'" class="p" (click)="r.status = 'present'">Present</button>
                  <button [class.on]="r.status === 'absent'" class="a" (click)="r.status = 'absent'">Absent</button>
                  <button [class.on]="r.status === 'late'" class="l" (click)="r.status = 'late'">Late</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="3" class="empty">
              @if (!classId) { Select a class to start. }
              @else { No students in this class yet. <a routerLink="/students">Add students →</a> }
            </td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (rows.length) {
      <div class="savebar">
        @if (msg) { <span class="ok">{{ msg }}</span> } @else { <span class="muted">{{ marked }} of {{ rows.length }} marked</span> }
        <button class="primary" [disabled]="saving || !marked" (click)="save()">{{ saving ? 'Saving...' : 'Save attendance' }}</button>
      </div>
    }
  </div>`,
  styles: [`
    .filters{display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:14px;align-items:end}
    .filters label{margin-top:0}
    .summary{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:16px 0 10px}
    .sum{background:#fff;border:1px solid var(--border);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column}
    .sum span{font-size:12px;color:var(--muted)} .sum b{font-size:22px}
    .sum.p b{color:var(--green)} .sum.a b{color:var(--red)} .sum.l b{color:var(--amber)}
    .progress{height:6px;background:var(--border);border-radius:99px;overflow:hidden;margin-bottom:14px}
    .progress div{height:100%;background:linear-gradient(90deg,#4f46e5,#16a34a);transition:width .25s}
    .actions{display:flex;gap:8px;margin-bottom:12px}
    .name{font-weight:500}
    .seg{display:inline-flex;gap:6px;flex-wrap:wrap;justify-content:center}
    .seg button{border:1px solid var(--border);background:#fff;padding:8px 14px;border-radius:999px;font-size:14px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .12s}
    .seg button:hover{border-color:#cbd5e1}
    .seg button.p.on{background:var(--green-soft);color:var(--green);border-color:var(--green)}
    .seg button.a.on{background:var(--red-soft);color:var(--red);border-color:var(--red)}
    .seg button.l.on{background:var(--amber-soft);color:var(--amber);border-color:var(--amber)}
    .empty{text-align:center!important;padding:32px;color:var(--muted)}
    .savebar{position:sticky;bottom:0;margin-top:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;
      background:rgba(255,255,255,.92);backdrop-filter:blur(6px);border:1px solid var(--border);border-radius:14px;padding:12px 16px;box-shadow:var(--shadow)}
    @media (max-width:700px){
      .filters{grid-template-columns:1fr 1fr} .filters div:last-child{grid-column:1/-1}
      .summary{grid-template-columns:repeat(3,1fr)}
      .seg button{padding:7px 10px;font-size:13px}
    }`]
})
export class AttendancePage {
  private api = inject(Api);
  classes: any[] = []; classId: number | null = null; rows: any[] = []; msg = ''; q = ''; saving = false;
  date = localDate();
  constructor() { loadClasses(this); }

  get filtered() { const q = this.q.trim().toLowerCase(); return q ? this.rows.filter(r => r.name.toLowerCase().includes(q)) : this.rows; }
  get marked() { return this.rows.filter(r => r.status).length; }

  onClass() {
    this.msg = '';
    if (!this.classId) { this.rows = []; return; }
    this.api.get<any[]>('/attendance', { class_id: this.classId, date: this.date }).subscribe(r => this.rows = r);
  }
  count(s: string) { return this.rows.filter(r => r.status === s).length; }
  setAll(s: string | null) { this.msg = ''; this.rows.forEach(r => r.status = s); }
  save() {
    this.saving = true; this.msg = '';
    const records = this.rows.map(r => ({ student_id: r.student_id, status: r.status }));
    this.api.post('/attendance', { date: this.date, records }).subscribe({
      next: r => { this.msg = `✓ Saved ${r.saved} records`; this.saving = false; },
      error: () => { this.msg = 'Could not save, please try again'; this.saving = false; }
    });
  }
}
