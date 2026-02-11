import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { DeviceService, Device } from '../../../core/services/device.service';
import { UserService } from '../../../core/services/user.service';
import { Report } from '../../../core/models/report.models';

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuario-dashboard.component.html'
})
export class UsuarioDashboardComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private eventService = inject(EventService);
  private deviceService = inject(DeviceService);
  private userService = inject(UserService);
  private router = inject(Router);

  myDevice = signal<Device | null>(null);
  myAlerts = signal<Report[]>([]); 
  accelData = signal<number[]>([40, 50, 45, 30, 70, 45, 60, 55, 40, 35, 50, 45]);
  private intervalId: any;

  // Lógica de Alerta: Cualquier evento de caída/botón sin confirmar activa el banner
  showEmergency = computed(() => {
    return this.myAlerts().some(alert => alert.confirmed === null && alert.fall_detected);
  });

  // Alerta más reciente para determinar el tipo en el banner (Botón o Caída)
  currentEmergency = computed(() => {
    return this.myAlerts().find(alert => alert.confirmed === null && alert.fall_detected);
  });

  // Los 3 últimos eventos procesados para el mini-feed
  recentAlerts = computed(() => {
    return [...this.myAlerts()].reverse().slice(0, 3);
  });

  ngOnInit() {
    this.loadUserData();
    this.startSimulation();
  }

  loadUserData() {
    // 1. Obtenemos datos del usuario actual (Seguridad /me)
    this.userService.getUserMe().subscribe({
      next: (user) => {
        // 2. Cargamos el dispositivo vinculado
        this.deviceService.getDevices().subscribe(devices => {
          const found = devices.find(d => d.user_id === user.id);
          this.myDevice.set(found || null);
        });

        // 3. Cargamos y procesamos las alertas
        this.eventService.getEvents().subscribe((events: Report[]) => {
          const filtered = events
            .filter(e => Number(e.user_id) === user.id)
            .map(report => ({
              ...report,
              // Clasificación: Si el impacto es bajo (< 1.5G) es el pulsador manual
              isPanicButton: Number(report.acc_z) < 1.5 && report.fall_detected
            }));
          this.myAlerts.set(filtered);
        });
      }
    });
  }

  irARevisarAlertas() { 
    this.router.navigate(['/usuario-alerts']); 
  }

  startSimulation() {
    this.intervalId = setInterval(() => {
      this.accelData.update(data => [...data.slice(1), Math.floor(Math.random() * 40) + 30]);
    }, 1000);
  }

  ngOnDestroy() { 
    if (this.intervalId) clearInterval(this.intervalId); 
  }
}