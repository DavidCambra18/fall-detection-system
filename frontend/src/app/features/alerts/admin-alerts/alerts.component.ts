import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common'; // Importamos solo lo necesario
import { ActivatedRoute } from '@angular/router'; 
import { forkJoin } from 'rxjs';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { DeviceService } from '../../../core/services/device.service';
import { Report } from '../../../core/models/report.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alerts',
  standalone: true,
  // Cambiamos CommonModule por DatePipe y NgClass (que es más específico)
  imports: [DatePipe, NgClass, FormsModule], 
  templateUrl: './alerts.component.html'
})
export class AlertsComponent implements OnInit {
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private deviceService = inject(DeviceService);
  private route = inject(ActivatedRoute); 
  public authService = inject(AuthService);

  allAlerts = signal<Report[]>([]);
  searchTerm = signal<string>('');
  viewTitle = signal<string>('Historial de Eventos');
  currentPage = signal<number>(1);
  pageSize = 10;

  private dynamicDeviceMap = signal<{ [key: number]: { alias: string, mac: string, owner: string } }>({});

  ngOnInit(): void {
    this.loadCatalogs();
  }

  loadCatalogs() {
    forkJoin({
      users: this.userService.getUsers(),
      devices: this.deviceService.getDevices()
    }).subscribe({
      next: (res) => {
        const map: any = {};
        res.devices.forEach(dev => {
          const owner = res.users.find(u => u.id === dev.user_id);
          map[dev.id] = {
            alias: dev.alias || `Disp. ${dev.device_id_logic}`,
            mac: dev.mac,
            owner: owner ? `${owner.name} ${owner.surnames || ''}` : 'Sin asignar'
          };
        });
        this.dynamicDeviceMap.set(map);
        this.loadAlerts();
      }
    });
  }

  getDeviceInfo(device_id: number) {
    return this.dynamicDeviceMap()[device_id] || { alias: '...', mac: '--', owner: '...' };
  }

  loadAlerts() {
    const role = this.authService.userRole();
    const user = this.authService.currentUser();
    const userId = user?.id;

    this.route.queryParams.subscribe(params => {
      const isTodayFilter = params['filter'] === 'today';

      this.eventService.getEvents().subscribe(data => {
        let result = [...data];

        // Filtros de Seguridad por Rol
        if (role === 2) result = result.filter(a => a.carer_id === userId);
        if (role === 3) result = result.filter(a => a.user_id === userId);

        if (isTodayFilter) {
          const hoy = new Date().toLocaleDateString('en-CA');
          result = result.filter(a => a.fall_detected && String(a.date_rep).includes(hoy));
          this.viewTitle.set('Alertas Críticas de Hoy');
        }

        this.allAlerts.set(result);
      });
    });
  }

  filteredAlerts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const alerts = this.allAlerts();
    if (!search) return alerts;

    return alerts.filter(a => {
      const info = this.getDeviceInfo(a.device_id);
      return info.owner.toLowerCase().includes(search) || 
             info.alias.toLowerCase().includes(search) ||
             info.mac.toLowerCase().includes(search);
    });
  });

  paginatedAlerts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAlerts().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredAlerts().length / this.pageSize) || 1);

  onConfirm(id: number, status: boolean) {
    this.eventService.confirmEvent(id, status).subscribe(() => this.loadAlerts());
  }
}