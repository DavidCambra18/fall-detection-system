import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si el usuario está autenticado (tiene token)
  if (!authService.isLoggedIn()) {
    console.warn('Acceso denegado: Usuario no autenticado.');
    router.navigate(['/login']);
    return false;
  }

  // 2. Obtener el usuario actual y los roles permitidos para esta ruta
  const user = authService.currentUser();
  const allowedRoles = route.data['roles'] as Array<number>;

  // 3. Si la ruta no tiene restricciones de roles, permitir el paso
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // 4. Verificar si el rol del usuario está dentro de los permitidos
  if (user && allowedRoles.includes(user.role_id)) {
    return true;
  }

  // 5. Si el usuario está logueado pero NO tiene permiso para ESTA ruta:
  console.error(`Acceso prohibido: El rol ${user?.role_id} no tiene permiso para ${state.url}`);
  
  // Redirección inteligente según su rol real
  const redirectMap: Record<number, string> = {
    1: '/admin-dashboard',
    2: '/cuidador-dashboard',
    3: '/usuario-dashboard'
  };

  const target = redirectMap[user?.role_id || 0] || '/login';
  router.navigate([target]);
  
  return false;
};