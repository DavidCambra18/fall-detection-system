// dashboard.component.ts refactorizado
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { UserService } from '../../../core/services/user.service';
import { DeviceService } from '../../../core/services/device.service'; // Asegúrate de tener este servicio
import { timer, Subscription, switchMap, forkJoin } from 'rxjs'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private deviceService = inject(DeviceService); // Inyectado
  private router = inject(Router);

  public Math = Math; 
  userName = signal<string>('Usuario');
  private poller?: Subscription;
  private usersCache = signal<any[]>([]);

  // Signals de estado
  totalUsers = signal<number>(0);
  totalDevices = signal<number>(0);
  todayFalls = signal<number>(0);
  lowBatteryCount = signal<number>(0);
  activeEmergency = signal<any | null>(null);
  activityData = signal<{hour: string, count: number, isFall: boolean}[]>([]);
  deviceTelemetry = signal<any[]>([]);

  ngOnInit() {
    this.loadInitialData();
    this.startDataRefresh();
  }

  ngOnDestroy() {
    this.poller?.unsubscribe();
  }

  private loadInitialData() {
    const user = this.authService.currentUser();
    if (user) this.userName.set(user.name || user.email.split('@')[0]);

    // Carga inicial de usuarios para el cache de nombres
    this.userService.getUsers().subscribe(users => {
      this.usersCache.set(users);
      this.totalUsers.set(users.length);
    });
  }

  private startDataRefresh() {
    // Polling cada 5 segundos
    this.poller = timer(0, 5000).pipe(
      switchMap(() => forkJoin({
        events: this.eventService.getEvents(),
        devices: this.deviceService.getDevices() // Traemos dispositivos reales
      }))
    ).subscribe({
      next: ({ events, devices }) => {
        const hoy = this.getFechaHoyLocal();
        
        // 1. Contador de Hardware Real
        this.totalDevices.set(devices.length); 

        // 2. Caídas de hoy
        const caidasHoy = events.filter(e => e.fall_detected && e.date_rep.startsWith(hoy));
        this.todayFalls.set(caidasHoy.length);

        // 3. Batería Baja (Basado en el estado real de la tabla 'devices')
        const lowBat = devices.filter((d: any) => d.status === 'low battery').length;
        this.lowBatteryCount.set(lowBat);

        // 4. Emergencia activa (Caída detectada hoy NO confirmada)
        const emergencia = events.find(e => 
          e.fall_detected && 
          (e.confirmed === null || e.confirmed === undefined) && 
          e.date_rep.startsWith(hoy)
        );
        this.activeEmergency.set(emergencia || null);

        this.updateRealTimeChart(events);
        
        // 5. Telemetría en vivo (Últimos 3 dispositivos con actividad)
        const activeIds = [...new Set(events.map(e => e.device_id))].slice(-3);
        const telemetry = activeIds.map(id => {
          const deviceEvents = events.filter(e => e.device_id === id).slice(-15);
          return {
            deviceId: id,
            patientName: this.getPatientName(deviceEvents[0]?.user_id),
            lastData: deviceEvents[deviceEvents.length - 1],
            history: deviceEvents
          };
        });
        this.deviceTelemetry.set(telemetry);
      }
    });
  }

  // ... (confirmFall, updateRealTimeChart, getFechaHoyLocal se mantienen igual)
  
  confirmFall(confirmed: boolean) {
    const event = this.activeEmergency();
    if (event && event.id) {
      this.eventService.confirmEvent(event.id, confirmed).subscribe({
        next: () => this.activeEmergency.set(null),
        error: (err) => console.error('Error:', err)
      });
    }
  }

  private updateRealTimeChart(events: any[]) {
    const hoy = this.getFechaHoyLocal();
    const chart = [];
    for (let i = 0; i < 24; i += 2) {
      const label = `${i.toString().padStart(2, '0')}-${(i + 2).toString().padStart(2, '0')}`;
      const eventosEnFranja = events.filter(e => {
        const horaEvento = e.date_rep.split(' ')[1]?.substring(0, 2);
        return e.date_rep.startsWith(hoy) && parseInt(horaEvento) >= i && parseInt(horaEvento) < (i + 2);
      });
      chart.push({ 
        hour: label, 
        count: eventosEnFranja.length, 
        isFall: eventosEnFranja.some(e => e.fall_detected) 
      });
    }
    this.activityData.set(chart);
  }

  getPatientName(id: number): string {
    const user = this.usersCache().find(u => u.id === id);
    return user ? `${user.name} ${user.surnames || ''}` : `Paciente #${id}`;
  }

  private getFechaHoyLocal(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  }

  goToTodayFalls() {
    this.router.navigate(['/history-admin'], { queryParams: { filter: 'today' } });
  }
}