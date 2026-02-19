import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../core/services/auth.service';
import { 
  SocialAuthService, 
  GoogleSigninButtonModule 
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, GoogleSigninButtonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);

  credentials = { email: '', password: '' };
  errorMessage = signal<string>('');

  private readonly ROLE_ROUTES: Record<number, string> = {
    1: '/admin-dashboard',
    2: '/cuidador-dashboard',
    3: '/usuario-dashboard'
  };

  ngOnInit() {
    // Escuchamos el estado de Google
    this.socialAuthService.authState.subscribe({
      next: (user) => {
        // Solo procedemos si hay un token Y si el usuario no acaba de cerrar sesión
        // (La librería a veces mantiene al usuario en el stream de datos)
        if (user?.idToken) {
          console.log('Validando sesión de Google...');
          this.onGoogleLogin(user.idToken);
        }
      },
      error: (err) => console.error("Error en SocialAuth:", err)
    });
  }

  onLogin() {
    this.errorMessage.set('');
    this.authService.login(this.credentials).subscribe({
      next: (res) => this.handleNavigation(res.user),
      error: () => this.errorMessage.set('Credenciales inválidas.')
    });
  }

  private onGoogleLogin(token: string) {
    this.authService.loginWithGoogle(token).subscribe({
      next: (res) => this.handleNavigation(res.user),
      error: (err) => {
        console.error('Error en validación backend:', err);
        this.errorMessage.set('Error al conectar con Google.');
      }
    });
  }

  private handleNavigation(user: any) {
    if (!user || !user.role_id) {
      this.router.navigate(['/dashboard']);
      return;
    }
    const target = this.ROLE_ROUTES[user.role_id] || '/dashboard';
    this.router.navigate([target]);
  }
}