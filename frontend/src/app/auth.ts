import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const getToken = () => localStorage.getItem('token');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const t = getToken();
  return next(t ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : req);
};

export const authGuard: CanActivateFn = () =>
  getToken() ? true : inject(Router).createUrlTree(['/login']);
