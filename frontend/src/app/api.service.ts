import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private u = environment.apiUrl;
  get<T = any>(path: string, params: any = {}) { return this.http.get<T>(this.u + path, { params }); }
  post<T = any>(path: string, body: any) { return this.http.post<T>(this.u + path, body); }
  delete<T = any>(path: string) { return this.http.delete<T>(this.u + path); }
}
