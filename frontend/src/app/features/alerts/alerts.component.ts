import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; 
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { Report } from '../../core/models/report.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html'
})
export class AlertsComponent implements OnInit {
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute); 
  public authService = inject(AuthService);

  allAlerts: Report[] = [];
  filteredAlerts = signal<Report[]>([]);
  
  searchTerm: string = '';
  viewTitle = signal<string>('Historial de Eventos');
  currentPage: number = 1;
  pageSize: number = 10;

  // Mapeo basado en tu init.sql
  private userMap: { [key: number]: { name: string, device: string } } = {
    3: { name: 'Marta Rövanpera', device: 'ESP32-001 (Marta)' },
    4: { name: 'Roberto Gómez Ruiz', device: 'ESP32-002 (Roberto)' },
    5: { name: 'Ana Sánchez Moreno', device: 'ESP32-003 (Ana)' }
  };

  ngOnInit(): void {
    this.loadAlerts();
  }

  getUserInfo(user_id: number) {
    return this.userMap[user_id] || { name: `Usuario ${user_id}`, device: 'Desconocido' };
  }

  get paginatedAlerts() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAlerts().slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredAlerts().length / this.pageSize) || 1;
  }

  get skeletonRows() {
    const remaining = this.pageSize - this.paginatedAlerts.length;
    return remaining > 0 ? Array(remaining).fill(0) : [];
  }

  loadAlerts() {
    const role = this.authService.userRole();
    const userId = this.authService.currentUser()?.id;

    this.route.queryParams.subscribe(params => {
      const isTodayFilter = params['filter'] === 'today';

      this.eventService.getEvents().subscribe(data => {
        let result = [...data];

        // Seguridad por rol (Admin ve todo, cuidador ve a sus pacientes 3, 4, 5)
        if (role === 2) result = result.filter(a => a.carer_id === userId);
        if (role === 3) result = result.filter(a => a.user_id === userId);

        if (isTodayFilter) {
          const hoy = new Date().toISOString().split('T')[0];
          result = result.filter(a => a.fall_detected && String(a.date_rep).includes(hoy));
          this.viewTitle.set('Alertas Críticas de Hoy');
        } else {
          this.viewTitle.set(role === 1 ? 'Historial Global' : 'Mis Alertas');
        }

        this.allAlerts = result;
        this.applySearchFilter();
      });
    });
  }

  applySearchFilter() {
    const search = this.searchTerm.toLowerCase().trim();
    let filtered = this.allAlerts;

    if (search) {
      filtered = this.allAlerts.filter(a => {
        const info = this.getUserInfo(a.user_id);
        return info.name.toLowerCase().includes(search) || 
               info.device.toLowerCase().includes(search) ||
               (a.fall_detected ? 'caída' : 'normal').includes(search);
      });
    }

    this.filteredAlerts.set(filtered);
    this.currentPage = 1;
  }

  onConfirm(id: number, status: boolean) {
    this.eventService.confirmEvent(id, status).subscribe(() => this.loadAlerts());
  }
}