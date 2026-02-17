import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgClass } from '@angular/common';
import { SocialAuthService } from '@abacritt/angularx-social-login'; // 🔥 Importación necesaria

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgClass],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService); // 🔥 Inyectamos el servicio de Google

  public isMobileMenuOpen = signal(false);

  // Lógica reactiva para los datos del usuario
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

  // Rutas computadas según el rol
  dashboardRoute = computed(() => {
    const role = this.currentUser().role_id;
    const routes: Record<number, string> = { 
      1: '/admin-dashboard', 
      2: '/cuidador-dashboard', 
      3: '/usuario-dashboard' 
    };
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

  // Cierre de sesión corregido
  async onLogout() {
    try {
      // 1. Cerramos sesión en el proveedor social (Google)
      // Usamos await o finally para asegurar que se intente cerrar antes de limpiar local
      await this.socialAuthService.signOut();
    } catch (error) {
      console.log('No había sesión de Google activa o ya estaba cerrada');
    } finally {
      // 2. Limpiamos el token y estado de nuestra App
      this.authService.logout();
      
      // 3. Redirigimos al login
      this.router.navigate(['/login']);
    }
  }
}