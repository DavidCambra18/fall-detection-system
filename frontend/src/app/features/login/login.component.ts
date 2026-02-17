import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule], // 🔥 Eliminamos CommonModule, no se usa
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };
  errorMessage = signal<string>(''); // 🔥 Mensaje de error como Signal

  private readonly ROUTES: Record<number, string> = {
    1: '/admin-dashboard',
    2: '/cuidador-dashboard',
    3: '/usuario-dashboard'
  };

  onLogin() {
    this.errorMessage.set(''); // Limpiamos errores previos
    
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        const user = res.user; 
        
        if (!user || !user.role_id) {
          this.errorMessage.set('Información de usuario incompleta.');
          return;
        }

        const target = this.ROUTES[user.role_id] || '/dashboard';
        this.router.navigate([target]);
      },
      error: (err) => {
        this.errorMessage.set('Credenciales inválidas o error de conexión.');
      }
    });
  }

  loginWithGoogle() {
    alert('Funcionalidad de Google en desarrollo');
  }
}