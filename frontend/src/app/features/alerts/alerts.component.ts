import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  public authService = inject(AuthService); // Público para usarlo en el HTML

  alerts = signal<Report[]>([]);

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts() {
    const role = this.authService.userRole();
    const userId = this.authService.currentUser()?.id;

    this.eventService.getEvents().subscribe(data => {
      if (role === 1) {
        this.alerts.set(data); // Admin: Todo
      } else if (role === 2) {
        this.alerts.set(data.filter(a => a.carer_id === userId)); // Cuidador: Sus pacientes
      } else {
        this.alerts.set(data.filter(a => a.user_id === userId)); // Paciente: Solo lo suyo
      }
    });
  }

  onConfirm(id: number, status: boolean) {
    this.eventService.confirmEvent(id, status).subscribe(() => this.loadAlerts());
  }
}