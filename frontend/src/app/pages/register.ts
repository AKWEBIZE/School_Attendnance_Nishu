import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../api.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="page narrow"><div class="card">
    <h2>New teacher login</h2>
    <form (ngSubmit)="save()">
      <input name="name" [(ngModel)]="f.name" placeholder="Full name" required />
      <input name="username" [(ngModel)]="f.username" placeholder="Username" required />
      <input name="email" [(ngModel)]="f.email" type="email" placeholder="Email (for password reset)" />
      <select name="class_id" [(ngModel)]="f.class_id">
        <option [ngValue]="null">Select your class</option>
        @for (c of classes; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
      </select>
      <input name="password" [(ngModel)]="f.password" type="password" placeholder="Password (min 6 chars)" required />
      @if (error) { <p class="error">{{ error }}</p> }
      <p class="center"><button class="primary block">Create account</button></p>
    </form>
    <p class="center"><a routerLink="/login">Back to login</a></p></div>
  </div>`
})
export class RegisterPage {
  private api = inject(Api);
  private router = inject(Router);
  f: any = { name: '', username: '', email: '', password: '', class_id: null };
  classes: any[] = []; error = '';
  constructor() { this.api.get<any[]>('/classes').subscribe(c => this.classes = c); }
  save() {
    this.api.post('/auth/register', this.f).subscribe({
      next: () => this.router.navigate(['/login']),
      error: e => this.error = e.error?.message || 'Could not create account'
    });
  }
}
