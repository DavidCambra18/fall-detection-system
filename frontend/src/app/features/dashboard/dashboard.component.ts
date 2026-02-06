import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private router = inject(Router);

  userName: string = 'Usuario';

  // Signals para los datos reales del panel
  totalUsers = signal<number>(0);
  totalDevices = signal<number>(0);
  todayFalls = signal<number>(0);

  ngOnInit() {
    this.loadUserData();
    this.loadRealStats();
  }

  private loadUserData() {
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.name || user.email.split('@')[0];
    }
  }

  private loadRealStats() {
    // 1. Usuarios Totales (desde tu UserService)
    this.userService.getUsers().subscribe({
      next: (users) => this.totalUsers.set(users.length),
      error: (err) => console.error('Error al contar usuarios', err)
    });

    // 2. Dispositivos y Caídas (desde el JSON de EventService)
    this.eventService.getEvents().subscribe({
      next: (events) => {
        // Dispositivos: Extraemos IDs únicos del JSON (en tu caso dará 3)
        const uniqueDevices = new Set(events.map(e => e.device_id));
        this.totalDevices.set(uniqueDevices.size);

        // Caídas Hoy: Filtrar fall_detected: true y fecha actual
        const todayStr = new Date().toISOString().split('T')[0];
        const fallsCount = events.filter(e => 
          e.fall_detected === true && 
          e.date_rep.startsWith(todayStr)
        ).length;
        this.todayFalls.set(fallsCount);
      },
      error: (err) => console.error('Error al cargar historial', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}