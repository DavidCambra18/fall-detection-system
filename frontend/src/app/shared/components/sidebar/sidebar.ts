import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgClass } from '@angular/common'; // Solo lo necesario

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgClass], // 🔥 Eliminamos CommonModule
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  public authService = inject(AuthService);
  private router = inject(Router);

  public isMobileMenuOpen = signal(false);

  // Mantenemos tu lógica de currentUser pero ahora es 100% reactiva con el Signal del AuthService
  public currentUser = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return { role_id: 0, name: 'Usuario', email: '' };

    const fallback = user.email ? user.email.split('@')[0] : 'Usuario';
    const displayName = user.name || (user as any).nombre || fallback;

    return {
      role_id: user.role_id || 0,
      name: displayName,
      email: user.email || ''
    };
  });

  // Convertimos los getters en computed para máxima eficiencia
  dashboardRoute = computed(() => {
    const role = this.currentUser().role_id;
    const routes: Record<number, string> = { 1: '/admin-dashboard', 2: '/cuidador-dashboard', 3: '/usuario-dashboard' };
    return routes[role] || '/login';
  });

  historyRoute = computed(() => {
    const role = this.currentUser().role_id;
    if (role === 1) return '/history-admin';
    if (role === 2) return '/history-cuidador';
    if (role === 3) return '/usuario-alerts';
    return '/login';
  });

  profileRoute = computed(() => {
    return this.currentUser().role_id === 3 ? '/usuario-users' : '';
  });

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}