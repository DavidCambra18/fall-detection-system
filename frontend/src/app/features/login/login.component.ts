import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };
  errorMessage = '';

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        console.log('Login exitoso', res);
        
        // Obtenemos el usuario autenticado para verificar su rol
        const user = this.authService.currentUser();
        
        if (!user) {
          this.errorMessage = 'No se pudo recuperar la información del usuario.';
          return;
        }

        // --- MOTOR DE REDIRECCIÓN POR ROL ---
        // 1: Admin, 2: Cuidador, 3: Usuario
        switch (user.roleId) {
          case 1:
            // Acceso total a gestión de hardware y usuarios
            this.router.navigate(['/admin-dashboard']);
            break;
          case 2:
            // Acceso a monitoreo de usuarios asignados y alertas
            this.router.navigate(['/cuidador-dashboard']);
            break;
          case 3:
            // Acceso personal a telemetría propia y estado de batería
            this.router.navigate(['/usuario-dashboard']);
            break;
          default:
            // Redirección genérica de seguridad
            this.router.navigate(['/dashboard']);
            break;
        }
      },
      error: (err) => {
        // Manejo de errores de credenciales o servidor
        this.errorMessage = 'Credenciales inválidas o error de conexión.';
      }
    });
  }

  loginWithGoogle() {
    console.log('Iniciando flujo de Google...');
    // Funcionalidad para futuras iteraciones de OAuth2
    alert('Funcionalidad de Google en desarrollo');
  }
}