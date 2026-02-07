import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Añadidos para parámetros
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
  private route = inject(ActivatedRoute); // Inyectado
  private router = inject(Router);         // Inyectado

  // Signals de estado
  allAlerts = signal<any[]>([]);
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = 10;
  
  // Signal para capturar el filtro de usuario de la URL
  userIdParam = signal<number | null>(null);

  editingId = signal<number | null>(null);

  ngOnInit() {
    // 1. Escuchar parámetros de la URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('userId');
      this.userIdParam.set(id ? Number(id) : null);
      this.currentPage.set(1); // Reset de página al cambiar filtro
    });

    this.loadHistory();
  }

  loadHistory() {
    this.eventService.getEvents().subscribe(events => {
      const myPatients = [3, 4, 5]; 
      const filtered = events.filter(e => 
        myPatients.includes(Number(e.user_id)) && e.fall_detected === true
      );
      this.allAlerts.set(filtered.reverse());
    });
  }

  // Lógica de filtrado combinada (Buscador + Parámetro de URL)
  filteredAlerts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filterId = this.userIdParam();
    
    let data = this.allAlerts();

    // Filtro 1: Por ID de usuario de la URL (si existe)
    if (filterId) {
      data = data.filter(alert => Number(alert.user_id) === filterId);
    }

    // Filtro 2: Por término de búsqueda
    if (term) {
      data = data.filter(alert => {
        const name = this.formatPatientName(alert.user_id).toLowerCase();
        return name.includes(term) || alert.user_id.toString().includes(term);
      });
    }

    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  });

  totalPages = computed(() => {
    const filterId = this.userIdParam();
    const term = this.searchTerm().toLowerCase();
    
    let data = this.allAlerts();

    if (filterId) data = data.filter(a => Number(a.user_id) === filterId);
    if (term) {
      data = data.filter(alert => {
        const name = this.formatPatientName(alert.user_id).toLowerCase();
        return name.includes(term) || alert.user_id.toString().includes(term);
      });
    }
    return Math.ceil(data.length / this.pageSize) || 1;
  });

  // Método para quitar el filtro de paciente y ver todo
  clearFilter() {
    this.router.navigate(['/history-cuidador']);
  }

  formatPatientName(id: number): string {
    const names: { [key: number]: string } = { 3: 'Marta', 4: 'Roberto', 5: 'Ana' };
    return names[id] || `Paciente #${id}`;
  }

  // --- Otros métodos de control (Se mantienen igual) ---
  toggleEdit(id: number) { this.editingId.set(this.editingId() === id ? null : id); }
  
  confirmAlert(alert: any, status: boolean | null) {
    this.eventService.confirmEvent(alert.id, status).subscribe({
      next: () => {
        this.allAlerts.update(alerts => 
          alerts.map(a => a.id === alert.id ? { ...a, confirmed: status } : a)
        );
        this.editingId.set(null);
      }
    });
  }

  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
}