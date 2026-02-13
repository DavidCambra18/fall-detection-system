import { Component, inject, computed, signal } from '@angular/core';
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

  public isMobileMenuOpen = signal(false);

  public currentUser = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return { role_id: 0, name: 'Usuario', email: '' };

    const fallback = user.email ? user.email.split('@')[0] : 'Usuario';
    const displayName = (user as any).name || (user as any).nombre || fallback;

    return {
      role_id: user.role_id || 0,
      name: displayName,
      email: user.email || ''
    };
  });

  get dashboardRoute(): string {
    const role = this.currentUser().role_id;
    const routes: Record<number, string> = { 1: '/admin-dashboard', 2: '/cuidador-dashboard', 3: '/usuario-dashboard' };
    return routes[role] || '/login';
  }

  get historyRoute(): string {
    const role = this.currentUser().role_id;
    if (role === 1) return '/history-admin';
    if (role === 2) return '/history-cuidador';
    if (role === 3) return '/usuario-alerts';
    return '/login';
  }

  // Nueva ruta para el perfil del usuario
  get profileRoute(): string {
    const role = this.currentUser().role_id;
    if (role === 3) return '/usuario-users';
    return ''; 
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}