import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule], // 🔥 Eliminamos CommonModule
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

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
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al crear la cuenta');
      }
    });
  }
}