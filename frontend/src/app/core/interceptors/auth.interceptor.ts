import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Obtenemos el valor actual del token desde el Signal
  // Al ser un Signal, lo llamamos como una función: token()
  const token = authService.token(); 

  let authReq = req;

  // 1. Inyectamos el Token si existe en el estado de la app
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Manejo de errores de autenticación y permisos
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401: No autorizado (Token expirado o inválido)
      // 403: Prohibido (El usuario está logueado pero no tiene permiso para esa acción)
      if (error.status === 401 || error.status === 403) {
        console.error(`Error de seguridad (${error.status}): Cerrando sesión...`);
        
        authService.logout();
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};