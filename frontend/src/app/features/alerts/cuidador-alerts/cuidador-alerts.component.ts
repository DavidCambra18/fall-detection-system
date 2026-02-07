import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cuidador-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuidador-alerts.component.html'
})
export class CuidadorAlertsComponent implements OnInit {
  private eventService = inject(EventService);
  public authService = inject(AuthService);

  // Señales de estado
  allAlerts = signal<any[]>([]);
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = 10;
  
  // Controla qué fila está mostrando las opciones de confirmación
  editingId = signal<number | null>(null);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.eventService.getEvents().subscribe(events => {
      // IDs de pacientes asignados a Manolo (ID 2)
      const myPatients = [3, 4, 5]; 
      const filtered = events.filter(e => 
        myPatients.includes(Number(e.user_id)) && e.fall_detected === true
      );
      this.allAlerts.set(filtered.reverse());
    });
  }

  // Abre o cierra el selector de opciones para una fila específica
  toggleEdit(id: number) {
    this.editingId.set(this.editingId() === id ? null : id);
  }

  confirmAlert(alert: any, status: boolean | null) {
    this.eventService.confirmEvent(alert.id, status).subscribe({
      next: () => {
        // Actualización reactiva de la lista local
        this.allAlerts.update(alerts => 
          alerts.map(a => a.id === alert.id ? { ...a, confirmed: status } : a)
        );
        this.editingId.set(null); // Cerramos el selector tras la acción
      },
      error: (err) => console.error('Error al actualizar alerta:', err)
    });
  }

  // Lógica de filtrado para el buscador y paginación
  filteredAlerts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.allAlerts().filter(alert => {
      const name = this.formatPatientName(alert.user_id).toLowerCase();
      return name.includes(term) || alert.user_id.toString().includes(term);
    });

    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  });

  totalPages = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.allAlerts().filter(alert => {
      const name = this.formatPatientName(alert.user_id).toLowerCase();
      return name.includes(term) || alert.user_id.toString().includes(term);
    });
    return Math.ceil(data.length / this.pageSize);
  });

  formatPatientName(id: number): string {
    const names: { [key: number]: string } = { 3: 'Marta', 4: 'Roberto', 5: 'Ana' };
    return names[id] || `Paciente #${id}`;
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }
}