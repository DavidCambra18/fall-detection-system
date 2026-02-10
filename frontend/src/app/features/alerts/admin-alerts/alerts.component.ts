import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html'
})
export class AlertsComponent implements OnInit {
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private deviceService = inject(DeviceService);
  private route = inject(ActivatedRoute); 
  public authService = inject(AuthService);

  allAlerts: Report[] = [];
  filteredAlerts = signal<Report[]>([]);
  
  searchTerm: string = '';
  viewTitle = signal<string>('Historial de Eventos');
  currentPage: number = 1;
  pageSize: number = 10;

  private dynamicDeviceMap: { [key: number]: { alias: string, mac: string, owner: string } } = {};

  ngOnInit(): void {
    this.loadCatalogs();
  }

  loadCatalogs() {
    forkJoin({
      users: this.userService.getUsers(),
      devices: this.deviceService.getDevices()
    }).subscribe({
      next: (res) => {
        res.devices.forEach(dev => {
          const owner = res.users.find(u => u.id === dev.user_id);
          this.dynamicDeviceMap[dev.id] = {
            alias: dev.alias || `Disp. ${dev.device_id_logic}`,
            mac: dev.mac,
            owner: owner ? `${owner.name} ${owner.surnames || ''}` : 'Sin asignar'
          };
        });
        this.loadAlerts();
      }
    });
  }

  getDeviceInfo(device_id: number) {
    return this.dynamicDeviceMap[device_id] || { alias: '...', mac: '--', owner: '...' };
  }

  loadAlerts() {
    const role = this.authService.userRole();
    const userId = this.authService.currentUser()?.id;

    this.route.queryParams.subscribe(params => {
      const isTodayFilter = params['filter'] === 'today';

      this.eventService.getEvents().subscribe(data => {
        let result = [...data];

        if (role === 2) result = result.filter(a => a.carer_id === userId);
        if (role === 3) result = result.filter(a => a.user_id === userId);

        if (isTodayFilter) {
          const hoy = new Date().toISOString().split('T')[0];
          result = result.filter(a => a.fall_detected && String(a.date_rep).includes(hoy));
          this.viewTitle.set('Alertas Críticas de Hoy');
        }

        this.allAlerts = result;
        this.applySearchFilter();
      });
    });
  }

  applySearchFilter() {
    const search = this.searchTerm.toLowerCase().trim();
    if (!search) {
      this.filteredAlerts.set(this.allAlerts);
      return;
    }

    const filtered = this.allAlerts.filter(a => {
      const info = this.getDeviceInfo(a.device_id);
      return info.owner.toLowerCase().includes(search) || 
             info.alias.toLowerCase().includes(search) ||
             info.mac.toLowerCase().includes(search);
    });

    this.filteredAlerts.set(filtered);
    this.currentPage = 1;
  }

  get paginatedAlerts() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAlerts().slice(start, start + this.pageSize);
  }

  get totalPages() { return Math.ceil(this.filteredAlerts().length / this.pageSize) || 1; }

  onConfirm(id: number, status: boolean) {
    this.eventService.confirmEvent(id, status).subscribe(() => this.loadAlerts());
  }
}