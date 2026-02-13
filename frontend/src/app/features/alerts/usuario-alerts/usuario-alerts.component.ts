import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Report } from '../../../core/models/report.models';

@Component({
  selector: 'app-usuario-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-alerts.component.html'
})
export class UsuarioAlertsComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  myAlerts = signal<Report[]>([]);
  isLoading = signal<boolean>(true);
  
  currentPage = signal<number>(1);
  itemsPerPage = 6;

  ngOnInit() { this.loadMyHistory(); }

  loadMyHistory() {
    const myId = this.authService.currentUser()?.id;
    if (!myId) return;

    this.eventService.getEvents().subscribe({
      next: (events: Report[]) => {
        // Filtramos por usuario y clasificamos el tipo de alerta
        const filtered = events
          .filter(e => Number(e.user_id) === myId)
          .map(e => ({
            ...e,
            // Clasificación basada en la fuerza G de impacto
            isPanicButton: Number(e.acc_z) < 1.5 && e.fall_detected
          }));

        this.myAlerts.set(filtered.reverse());
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  paginatedAlerts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.myAlerts().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.myAlerts().length / this.itemsPerPage) || 1);

  confirmarMiAlerta(alert: Report, estado: boolean) {
    this.eventService.confirmEvent(alert.id, estado).subscribe({
      next: () => {
        this.myAlerts.update(alerts => 
          alerts.map(a => a.id === alert.id ? { ...a, confirmed: estado } : a)
        );
      }
    });
  }

  resetearAlerta(alert: Report) {
    this.eventService.confirmEvent(alert.id, null).subscribe({
      next: () => {
        this.myAlerts.update(alerts => 
          alerts.map(a => a.id === alert.id ? { ...a, confirmed: null } : a)
        );
      }
    });
  }
}