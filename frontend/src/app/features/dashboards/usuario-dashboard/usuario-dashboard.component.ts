import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { DatePipe, NgClass, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { DeviceService, Device } from '../../../core/services/device.service';
import { UserService } from '../../../core/services/user.service';
import { forkJoin, switchMap, timer, Subscription, of } from 'rxjs';

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [NgClass, RouterModule, DatePipe, DecimalPipe],
  templateUrl: './usuario-dashboard.component.html'
})
export class UsuarioDashboardComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private eventService = inject(EventService);
  private deviceService = inject(DeviceService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Vital para que el HTML pueda usar funciones matemáticas
  public Math = Math; 

  myDevice = signal<Device | null>(null);
  myAlerts = signal<any[]>([]); 
  accelData = signal<{val: number, isFall: boolean}[]>([]);
  private poller?: Subscription;

  showEmergency = computed(() => {
    return this.myAlerts().some(alert => (alert.confirmed === null || alert.confirmed === undefined) && alert.fall_detected);
  });

  currentEmergency = computed(() => {
    return this.myAlerts().find(alert => (alert.confirmed === null || alert.confirmed === undefined) && alert.fall_detected);
  });

  recentAlerts = computed(() => {
    return [...this.myAlerts()].reverse().slice(0, 3);
  });

  ngOnInit() {
    this.startDataRefresh();
  }

  ngOnDestroy() { 
    this.poller?.unsubscribe(); 
  }

  private startDataRefresh() {
    // Refresco automático cada 5 segundos
    this.poller = timer(0, 5000).pipe(
      switchMap(() => this.userService.getUserMe()),
      switchMap(user => {
        if (!user) return of(null);
        return forkJoin({
          user: of(user),
          devices: this.deviceService.getDevices(),
          events: this.eventService.getEvents()
        });
      })
    ).subscribe({
      next: (data: any) => {
        if (!data) return;
        
        const { user, devices, events } = data;
        const found = devices.find((d: any) => d.user_id === user.id);
        this.myDevice.set(found || null);

        const filtered = events
          .filter((e: any) => Number(e.user_id) === user.id)
          .map((report: any) => ({
            ...report,
            isPanicButton: Number(report.acc_z) < 1.5 && report.fall_detected
          }));
        this.myAlerts.set(filtered);

        // Últimos 15 puntos para la gráfica
        const lastEvents = filtered.slice(-15);
        const chartValues = lastEvents.map((e: any) => {
          // Fuerza G total (Magnitud del vector aceleración)
          const magnitude = Math.sqrt(
            Math.pow(Number(e.acc_x || 0), 2) + 
            Math.pow(Number(e.acc_y || 0), 2) + 
            Math.pow(Number(e.acc_z || 0), 2)
          );
          return {
            val: magnitude * 10,
            isFall: !!e.fall_detected
          };
        });
        this.accelData.set(chartValues);
      },
      error: (err) => console.error('Error cargando datos de usuario:', err)
    });
  }

  irARevisarAlertas() { 
    this.router.navigate(['/usuario-alerts']); 
  }
}