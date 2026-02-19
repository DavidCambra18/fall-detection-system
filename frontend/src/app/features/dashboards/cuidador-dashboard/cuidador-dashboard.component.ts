import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { NgClass, CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { DeviceService, Device } from '../../../core/services/device.service';
import { Report } from '../../../core/models/report.models'; 
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-cuidador-dashboard',
  standalone: true,
  imports: [NgClass, RouterModule, CommonModule, DatePipe],
  templateUrl: './cuidador-dashboard.component.html'
})
export class CuidadorDashboardComponent implements OnInit, OnDestroy {
  public eventService = inject(EventService);
  public authService = inject(AuthService);
  private userService = inject(UserService);
  private deviceService = inject(DeviceService);
  
  private intervalId: any;
  
  // Señales de Estado
  public activeAlert = signal<Report | null>(null); 
  public myPatients = signal<User[]>([]);
  public latestEvents = signal<Report[]>([]);
  public devices = signal<Device[]>([]);
  public stats = signal({ total: 0, critical: 0, active: 0 });

  ngOnInit() {
    this.loadInitialData();
    // Polling cada 5 segundos para mantener el "Live Stream"
    this.intervalId = setInterval(() => this.refreshData(), 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadInitialData() {
    const user = this.authService.currentUser();
    const carerId = user?.id;
    if (!carerId) return;

    this.userService.getUsersCaredByCarer(carerId).subscribe(users => {
      this.myPatients.set(users);
      this.stats.update(s => ({ ...s, total: users.length }));
      this.refreshData();
    });
  }

  refreshData() {
    const patientIds = this.myPatients().map(p => p.id);
    if (patientIds.length === 0) return;

    // 1. Obtener Eventos y filtrar por pacientes asignados
    this.eventService.getEvents().subscribe({
      next: (events: Report[]) => {
        const myEvents = events.filter(e => patientIds.includes(Number(e.user_id)));
        
        // Tabla de Actividad: Ordenar por fecha y tomar los 5 más recientes
        this.latestEvents.set(
          [...myEvents].sort((a, b) => new Date(b.date_rep).getTime() - new Date(a.date_rep).getTime()).slice(0, 5)
        );

        // Alerta Crítica (Mantenemos tu lógica de emergencia)
        const emergency = myEvents.find(e => e.fall_detected && e.confirmed === null);
        if (emergency) {
          emergency.isPanicButton = Number(emergency.acc_z) < 1.5;
        }
        this.activeAlert.set(emergency || null);
        
        this.stats.update(s => ({
          ...s,
          critical: myEvents.filter(e => e.fall_detected && e.confirmed === null).length
        }));
      }
    });

    // 2. Obtener Dispositivos y filtrar por pacientes
    this.deviceService.getDevices().subscribe(allDevices => {
      const filtered = allDevices.filter(d => d.user_id && patientIds.includes(d.user_id));
      this.devices.set(filtered);
      this.stats.update(s => ({ ...s, active: filtered.filter(d => d.status === 'active').length }));
    });
  }

  getPatientName(id: number): string {
    const patient = this.myPatients().find(p => p.id === id);
    return patient ? `${patient.name} ${patient.surnames || ''}` : `Paciente #${id}`;
  }
}