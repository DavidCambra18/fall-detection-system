import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-usuario-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-alerts.component.html'
})
export class UsuarioAlertsComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  myAlerts = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  
  // Lógica de paginación
  currentPage = signal<number>(1);
  itemsPerPage = 5;

  ngOnInit() { this.loadMyHistory(); }

  loadMyHistory() {
    const myId = this.authService.currentUser()?.id;
    if (!myId) return;

    this.eventService.getEvents().subscribe({
      next: (events) => {
        const filtered = events.filter(e => Number(e.user_id) === myId);
        this.myAlerts.set(filtered.reverse());
        this.isLoading.set(false);
      }
    });
  }

  // Alertas paginadas reactivas
  paginatedAlerts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.myAlerts().slice(start, end);
  });

  // Total de páginas
  totalPages = computed(() => Math.ceil(this.myAlerts().length / this.itemsPerPage));

  confirmarMiAlerta(alert: any, estado: boolean) {
    this.eventService.confirmEvent(alert.id, estado).subscribe({
      next: () => {
        this.myAlerts.update(alerts => 
          alerts.map(a => a.id === alert.id ? { ...a, confirmed: estado } : a)
        );
      }
    });
  }

  resetearAlerta(alert: any) {
    this.eventService.confirmEvent(alert.id, null).subscribe({
      next: () => {
        this.myAlerts.update(alerts => 
          alerts.map(a => a.id === alert.id ? { ...a, confirmed: null } : a)
        );
      }
    });
  }
}