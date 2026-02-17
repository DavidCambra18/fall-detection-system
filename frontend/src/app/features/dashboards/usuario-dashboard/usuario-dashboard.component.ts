import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common'; // Importaciones específicas
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { DeviceService, Device } from '../../../core/services/device.service';
import { UserService } from '../../../core/services/user.service';
import { Report } from '../../../core/models/report.models';

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [NgClass, RouterModule, DatePipe], // Sin CommonModule
  templateUrl: './usuario-dashboard.component.html'
})
export class UsuarioDashboardComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private eventService = inject(EventService);
  private deviceService = inject(DeviceService);
  private userService = inject(UserService);
  private router = inject(Router);

  myDevice = signal<Device | null>(null);
  myAlerts = signal<any[]>([]); 
  accelData = signal<number[]>([40, 50, 45, 30, 70, 45, 60, 55, 40, 35, 50, 45]);
  private intervalId: any;

  // Lógica de Alerta Reactiva
  showEmergency = computed(() => {
    return this.myAlerts().some(alert => alert.confirmed === null && alert.fall_detected);
  });

  currentEmergency = computed(() => {
    return this.myAlerts().find(alert => alert.confirmed === null && alert.fall_detected);
  });

  recentAlerts = computed(() => {
    return [...this.myAlerts()].reverse().slice(0, 3);
  });

  ngOnInit() {
    this.loadUserData();
    this.startSimulation();
  }

  loadUserData() {
    // Usamos el servicio de usuario para obtener mis datos
    this.userService.getUserMe().subscribe({
      next: (user) => {
        // Carga de dispositivo
        this.deviceService.getDevices().subscribe(devices => {
          const found = devices.find(d => d.user_id === user.id);
          this.myDevice.set(found || null);
        });

        // Carga de alertas con clasificación automática
        this.eventService.getEvents().subscribe((events: Report[]) => {
          const filtered = events
            .filter(e => Number(e.user_id) === user.id)
            .map(report => ({
              ...report,
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
    // La actualización de signals es mucho más ligera para animaciones de 1s
    this.intervalId = setInterval(() => {
      this.accelData.update(data => [...data.slice(1), Math.floor(Math.random() * 40) + 30]);
    }, 1000);
  }

  ngOnDestroy() { 
    if (this.intervalId) clearInterval(this.intervalId); 
  }
}