import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signal para manejar el estado de carga
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Objeto de datos que coincide con RegisterInput de tu backend
  regData = {
    email: '',
    password: '',
    name: '',
    surnames: '',
    date_born: '',
    phone_num: ''
  };

  onRegister() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.regData).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Redirigir al login tras éxito
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al crear la cuenta');
      }
    });
  }
}