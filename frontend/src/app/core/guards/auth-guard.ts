import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si el usuario está autenticado
  if (!authService.isLoggedIn()) {
    console.warn('Acceso denegado: Usuario no autenticado.');
    router.navigate(['/login']);
    return false;
  }

  // 2. Obtener el usuario actual (Invocamos el signal)
  // Al usar signals, accedemos con parentesis: currentUser()
  const user = authService.currentUser();
  const allowedRoles = route.data['roles'] as Array<number>;

  // 3. Si la ruta es libre para logueados, dejar pasar
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // 4. Verificar rol (Aseguramos que role_id sea número por si acaso)
  if (user && allowedRoles.includes(Number(user.role_id))) {
    return true;
  }

  // 5. Redirección si el rol no coincide
  console.error(`Acceso prohibido para rol: ${user?.role_id}`);
  
  const redirectMap: Record<number, string> = {
    1: '/admin-dashboard',
    2: '/cuidador-dashboard',
    3: '/usuario-dashboard'
  };

  const target = redirectMap[Number(user?.role_id) || 0] || '/login';
  router.navigate([target]);
  
  return false;
};