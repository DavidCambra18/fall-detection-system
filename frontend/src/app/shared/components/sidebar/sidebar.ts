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
   * Usamos computed con un valor por defecto.
   * Esto evita que el HTML intente leer propiedades de 'null' 
   * y active redirecciones accidentales al login.
   */
  public currentUser = computed(() => {
    const user = this.authService.currentUser();
    return user || { roleId: 0, name: 'Invitado', email: '' };
  });

  /**
   * Centralizamos la lógica de navegación por rol para el HTML.
   * Evita ternarios complejos en el template que suelen fallar.
   */
  get dashboardRoute(): string {
    const role = this.currentUser().roleId;
    if (role === 1) return '/admin-dashboard';
    if (role === 2) return '/cuidador-dashboard';
    return '/login';
  }

  get historyRoute(): string {
    const role = this.currentUser().roleId;
    if (role === 1) return '/history-admin';
    if (role === 2) return '/history-cuidador';
    return '/login';
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}