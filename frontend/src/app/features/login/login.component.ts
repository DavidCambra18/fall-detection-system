import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Importamos RouterModule
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Añadido RouterModule aquí
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };
  errorMessage = '';

  private readonly ROUTES: Record<number, string> = {
    1: '/admin-dashboard',
    2: '/cuidador-dashboard',
    3: '/usuario-dashboard'
  };

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        const user = res.user; 
        
        if (!user || !user.role_id) {
          this.errorMessage = 'Información de usuario incompleta.';
          return;
        }

        const target = this.ROUTES[user.role_id] || '/dashboard';
        this.router.navigate([target]);
      },
      error: (err) => {
        this.errorMessage = 'Credenciales inválidas o error de conexión.';
      }
    });
  }

  loginWithGoogle() {
    alert('Funcionalidad de Google en desarrollo');
  }
}