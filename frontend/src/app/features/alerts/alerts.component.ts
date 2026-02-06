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

  // MAPEO REAL BASADO EN TU INIT.SQL
  // Relacionamos el ID del dispositivo con su Alias, MAC y Dueño
  private deviceMap: { [key: number]: { alias: string, mac: string, owner: string, status: string } } = {
    1: { alias: 'Dispositivo de Marta', mac: 'AA:BB:CC:11:22:33', owner: 'Marta Rövanpera', status: 'active' },
    2: { alias: 'Dispositivo de Roberto', mac: 'AA:BB:CC:11:22:34', owner: 'Roberto Gómez Ruiz', status: 'active' },
    3: { alias: 'Dispositivo de Ana', mac: 'AA:BB:CC:11:22:35', owner: 'Ana Sánchez Moreno', status: 'low battery' }
  };

  ngOnInit(): void {
    this.loadAlerts();
  }

  getDeviceInfo(device_id: number) {
    return this.deviceMap[device_id] || { alias: 'Desconocido', mac: '--:--', owner: 'Desconocido', status: 'inactive' };
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

        // Filtros de seguridad (Admin ve todo)
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
        const info = this.getDeviceInfo(a.device_id);
        return info.owner.toLowerCase().includes(search) || 
               info.alias.toLowerCase().includes(search) ||
               info.mac.toLowerCase().includes(search);
      });
    }

    this.filteredAlerts.set(filtered);
    this.currentPage = 1;
  }

  onConfirm(id: number, status: boolean) {
    this.eventService.confirmEvent(id, status).subscribe(() => this.loadAlerts());
  }
}