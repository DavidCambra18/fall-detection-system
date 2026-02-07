import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken(); // Usamos el método del servicio

  let authReq = req;

  // 1. Inyectamos el Token si existe
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Capturamos la respuesta y manejamos errores de seguridad
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor dice que no estamos autorizados (Token caducado o malvado)
      if (error.status === 401) {
        console.warn('Sesión expirada o no autorizada. Redirigiendo al login...');
        authService.logout(); // Limpiamos los datos de sesión
        router.navigate(['/login']); // Mandamos al usuario a identificarse de nuevo
      }
      
      return throwError(() => error);
    })
  );
};