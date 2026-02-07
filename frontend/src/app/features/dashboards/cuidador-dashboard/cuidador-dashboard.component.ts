import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cuidador-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cuidador-dashboard.component.html'
})
export class CuidadorDashboardComponent implements OnInit, OnDestroy {
  public eventService = inject(EventService);
  public authService = inject(AuthService);
  
  private intervalId: any;

  // Solo mantenemos lo necesario para el aviso y los contadores
  public activeAlert = signal<any | null>(null); 
  public stats = signal({ total: 3, critical: 0, active: 3 });

  ngOnInit() {
    this.refreshData();
    this.intervalId = setInterval(() => this.refreshData(), 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  refreshData() {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        const myPatients = [3, 4, 5];
        const myEvents = events.filter(e => myPatients.includes(Number(e.user_id)) && e.fall_detected);

        // Buscamos la alerta de emergencia (la primera que esté sin confirmar)
        const emergency = myEvents.find(e => e.confirmed === null);
        this.activeAlert.set(emergency || null);

        // Actualizamos el contador de críticas
        this.stats.update(s => ({
          ...s,
          critical: myEvents.filter(e => e.confirmed === null).length
        }));
      }
    });
  }

  getPatientName(id: number): string {
    const names: { [key: number]: string } = { 3: 'Marta', 4: 'Roberto', 5: 'Ana' };
    return names[id] || `Paciente #${id}`;
  }
}