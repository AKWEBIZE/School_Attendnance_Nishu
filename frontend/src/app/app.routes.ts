import { Routes } from '@angular/router';
import { authGuard } from './auth';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ForgotPage } from './pages/forgot';
import { DashboardPage } from './pages/dashboard';
import { AttendancePage } from './pages/attendance';
import { EventsPage } from './pages/events';
import { CircularsPage } from './pages/circulars';
import { StudentsPage } from './pages/students';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'forgot', component: ForgotPage },
  { path: '', component: DashboardPage, canActivate: [authGuard] },
  { path: 'attendance', component: AttendancePage, canActivate: [authGuard] },
  { path: 'events', component: EventsPage, canActivate: [authGuard] },
  { path: 'circulars', component: CircularsPage, canActivate: [authGuard] },
  { path: 'students', component: StudentsPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
