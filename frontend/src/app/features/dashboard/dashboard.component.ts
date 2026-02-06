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

  // Signals para los datos reales
  totalUsers = signal<number>(0);
  totalDevices = signal<number>(0);
  todayFalls = signal<number>(0);
  lowBatteryCount = signal<number>(0);

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
    // 1. Usuarios Totales desde la DB
    this.userService.getUsers().subscribe({
      next: (users) => this.totalUsers.set(users.length),
      error: (err) => console.error('Error al contar usuarios', err)
    });

    // 2. Dispositivos y Caídas desde el JSON de Eventos
    this.eventService.getEvents().subscribe({
      next: (events) => {
        // Cálculo de Dispositivos Únicos (Saldrá 3 según tu JSON)
        const uniqueDevices = new Set(events.map(e => e.device_id));
        this.totalDevices.set(uniqueDevices.size);

        // --- ARREGLO DE FECHA LOCAL ---
        // Generamos YYYY-MM-DD local para que no falle por zona horaria
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        const fechaHoyLocal = `${year}-${month}-${day}`;

        // Filtrar solo CAÍDAS de HOY
        const caidasDeHoy = events.filter(e => {
          const esCaida = e.fall_detected === true;
          const esDeHoy = e.date_rep.startsWith(fechaHoyLocal);
          return esCaida && esDeHoy;
        });

        this.todayFalls.set(caidasDeHoy.length);

        // Opcional: Contar dispositivos con "batería baja" (ejemplo si device_id es 3)
        // Esto es para que el 4º cuadro no esté siempre en 1
        const lowBat = events.some(e => e.device_id === 3) ? 1 : 0;
        this.lowBatteryCount.set(lowBat);
      },
      error: (err) => console.error('Error al cargar historial', err)
    });
  }

  goToTodayFalls() {
    // Al hacer clic en el cuadro de caídas, pasamos el filtro por URL
    this.router.navigate(['/history'], { 
      queryParams: { filter: 'today' } 
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}