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

  // Usamos un alias para facilitar la lectura en el HTML
  public currentUser = computed(() => this.authService.currentUser());

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}