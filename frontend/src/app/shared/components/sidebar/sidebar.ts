import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common'; // Importante para el *ngIf

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  // Inyectamos el servicio como público para usarlo en el HTML
  public authService = inject(AuthService);
  private router = inject(Router);

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}