import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { UserService } from '../../core/services/user.service';
import { timer, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-cuidador-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: ``
})
export class CuidadorDashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private userService = inject(UserService);

  private poller?: Subscription;
  
  // Lista de Usuarios asignados a este cuidador
  assignedUsers = signal<any[]>([]);
  activeEmergency = signal<any | null>(null);

  ngOnInit() {
    this.loadAssignedUsers();
    this.startEmergencyPolling();
  }

  ngOnDestroy() {
    this.poller?.unsubscribe();
  }

  private loadAssignedUsers() {
    const currentCuidador = this.authService.currentUser();
    if (!currentCuidador) return;

    // Filtramos los Usuarios por carer_id
    this.userService.getUsers().subscribe(users => {
      const filtered = users.filter(u => u.carer_id === currentCuidador.id);
      this.assignedUsers.set(filtered);
    });
  }

  private startEmergencyPolling() {
    this.poller = timer(0, 5000).pipe(
      switchMap(() => this.eventService.getEvents())
    ).subscribe(events => {
      const hoy = new Date().toISOString().split('T')[0];
      const myUserIds = this.assignedUsers().map(u => u.id);

      // Buscamos caídas de NUESTROS Usuarios
      const alert = events.find(e => 
        myUserIds.includes(e.user_id) && 
        e.fall_detected && 
        e.confirmed === null && 
        e.date_rep.startsWith(hoy)
      );
      this.activeEmergency.set(alert || null);
    });
  }

  confirmAlert(confirmed: boolean) {
    if (this.activeEmergency()) {
      this.eventService.confirmEvent(this.activeEmergency().id, confirmed)
        .subscribe(() => this.activeEmergency.set(null));
    }
  }
}