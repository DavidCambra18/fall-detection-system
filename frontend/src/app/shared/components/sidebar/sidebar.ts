import { Component, inject, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  public authService = inject(AuthService);
  private router = inject(Router);

  /**
   * SEÑAL REACTIVA: Extraemos el usuario y mapeamos el nombre.
   */
  public currentUser = computed(() => {
    const user = this.authService.currentUser();
    
    // Si no hay usuario, devolvemos un estado por defecto
    if (!user) return { role_id: 0, name: 'Usuario', email: '' };

    // MAPEÓ FLEXIBLE: 
    // Como vimos en consola que 'name' no llega, usamos el email como fallback
    const fallback = user.email ? user.email.split('@')[0] : 'Usuario';
    const displayName = (user as any).name || (user as any).nombre || fallback;

    return {
      role_id: user.role_id || 0,
      name: displayName,
      email: user.email || ''
    };
  });

  /**
   * Rutas centralizadas optimizadas.
   */
  get dashboardRoute(): string {
    const role = this.currentUser().role_id;
    const routes: Record<number, string> = {
      1: '/admin-dashboard',
      2: '/cuidador-dashboard',
      3: '/usuario-dashboard'
    };
    return routes[role] || '/login';
  }

  get historyRoute(): string {
    const role = this.currentUser().role_id;
    if (role === 1) return '/history-admin';
    if (role === 2) return '/history-cuidador';
    if (role === 3) return '/usuario-alerts'; // Añadido para Rol 3
    return '/login';
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}