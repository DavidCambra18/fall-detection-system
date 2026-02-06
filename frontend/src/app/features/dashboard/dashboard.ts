import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName: string = '';

  ngOnInit() {
    // Recuperamos el nombre del usuario del localStorage para dar la bienvenida
    const userData = localStorage.getItem('user');
    if (userData) {
      this.userName = JSON.parse(userData).email;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}