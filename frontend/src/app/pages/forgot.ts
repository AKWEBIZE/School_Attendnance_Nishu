import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../api.service';

@Component({
  selector: 'app-forgot',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="page">
    @if (!token) {
      <h2>Forgot password</h2>
      <input [(ngModel)]="username" placeholder="Username" />
      <p class="center"><button class="primary" (click)="request()">Send reset link</button></p>
    } @else {
      <h2>Set new password</h2>
      <input [(ngModel)]="password" type="password" placeholder="New password" />
      <p class="center"><button class="primary" (click)="reset()">Update password</button></p>
    }
    @if (msg) { <p class="ok">{{ msg }}</p> }
    @if (error) { <p class="error">{{ error }}</p> }
    <p class="center"><a routerLink="/login">Back to login</a></p>
  </div>`
})
export class ForgotPage {
  private api = inject(Api);
  token = inject(ActivatedRoute).snapshot.queryParamMap.get('token');
  username = ''; password = ''; msg = ''; error = '';
  request() {
    this.api.post('/auth/forgot', { username: this.username }).subscribe({
      next: r => this.msg = r.message, error: e => this.error = e.error?.message || 'Error' });
  }
  reset() {
    this.api.post('/auth/reset', { token: this.token, password: this.password }).subscribe({
      next: r => this.msg = r.message + '. You can log in now.', error: e => this.error = e.error?.message || 'Error' });
  }
}
