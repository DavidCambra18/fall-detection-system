import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; 
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { Report } from '../../core/models/report.models';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html'
})
export class AlertsComponent implements OnInit {
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute); 
  public authService = inject(AuthService);

  alerts = signal<Report[]>([]);
  viewTitle = signal<string>('Historial de Eventos');

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts() {
    const role = this.authService.userRole();
    const userId = this.authService.currentUser()?.id;

    this.route.queryParams.subscribe(params => {
      const isTodayFilter = params['filter'] === 'today';

      this.eventService.getEvents().subscribe(data => {
        let filteredData = [...data];

        // 1. FILTRO DE SEGURIDAD POR ROL
        if (role === 2) {
          filteredData = filteredData.filter(a => a.carer_id === userId);
        } else if (role === 3) {
          filteredData = filteredData.filter(a => a.user_id === userId);
        }

        // 2. FILTRO INTELIGENTE PARA EL BOTÓN "CAÍDAS HOY"
        if (isTodayFilter) {
          // Obtenemos la fecha local actual
          const hoy = new Date();
          const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
          
          filteredData = filteredData.filter(a => {
            // Convertimos a String para comparar la fecha con seguridad
            const fechaRegistro = a.date_rep ? String(a.date_rep) : '';
            
            // Eliminamos la comparación con 'true' (string) para evitar el error ts(2367)
            // Simplemente usamos el valor booleano directamente
            return a.fall_detected === true && fechaRegistro.includes(fechaHoy);
          });
          
          this.viewTitle.set('Alertas Críticas de Hoy');
        } else {
          this.viewTitle.set(role === 1 ? 'Historial Global' : 'Mis Registros');
        }

        this.alerts.set(filteredData);
      });
    });
  }

  onConfirm(id: number, status: boolean) {
    this.eventService.confirmEvent(id, status).subscribe(() => this.loadAlerts());
  }
}