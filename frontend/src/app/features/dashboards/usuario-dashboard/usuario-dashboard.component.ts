import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { DeviceService, Device } from '../../../core/services/device.service';

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
  private router = inject(Router);

  myDevice = signal<Device | null>(null);
  myAlerts = signal<any[]>([]); 
  accelData = signal<number[]>([40, 50, 45, 30, 70, 45, 60, 55, 40, 35, 50, 45]);
  private intervalId: any;

  // Lógica de Alerta: Cualquier pendiente activa el banner
  showEmergency = computed(() => {
    return this.myAlerts().some(alert => alert.confirmed === null);
  });

  // NUEVO: Extraemos los 3 últimos eventos para el mini-feed del dashboard
  recentAlerts = computed(() => {
    return [...this.myAlerts()].reverse().slice(0, 3);
  });

  ngOnInit() {
    this.loadUserData();
    this.startSimulation();
  }

  loadUserData() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.deviceService.getDevices().subscribe({
      next: (devices: Device[]) => {
        const found = devices.find(d => d.user_id === user.id);
        this.myDevice.set(found || null);
      }
    });

    this.eventService.getEvents().subscribe((events) => {
      const filtered = events.filter(e => Number(e.user_id) === user.id);
      this.myAlerts.set(filtered);
    });
  }

  irARevisarAlertas() {
    this.router.navigate(['/usuario-alerts']);
  }

  startSimulation() {
    this.intervalId = setInterval(() => {
      this.accelData.update(data => [...data.slice(1), Math.floor(Math.random() * 70) + 20]);
    }, 800);
  }

  ngOnDestroy() { if (this.intervalId) clearInterval(this.intervalId); }
}