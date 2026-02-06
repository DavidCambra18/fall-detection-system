import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Añadido RouterModule para los enlaces
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Es vital incluir RouterModule si usas routerLink en el HTML del dashboard
  imports: [CommonModule, RouterModule], 
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  // Cambiamos a 'public' para que el HTML pueda acceder a authService.getRole()
  public authService = inject(AuthService);
  private router = inject(Router);

  userName: string = 'Usuario';

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Priorizamos el nombre si existe, si no, usamos la parte anterior al @ del email
        this.userName = user.name || user.email.split('@')[0];
      } catch (e) {
        console.error('Error parseando datos de usuario', e);
      }
    }
  }

  // Aunque el Sidebar tiene su logout, dejamos este por si usas botones rápidos en el Dashboard
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}