import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { EventService } from '../../../core/services/event.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cuidador-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuidador-dashboard.component.html'
})
export class CuidadorDashboardComponent implements OnInit {
  // Cambiado a public para que el HTML (Imagen 4) pueda acceder sin error
  public authService = inject(AuthService);
  private userService = inject(UserService);
  private eventService = inject(EventService);

  assignedUsers = signal<any[]>([]);
  recentAlerts = signal<any[]>([]);
  stats = signal({ total: 0, critical: 0, active: 0 });

  ngOnInit() {
    const me = this.authService.currentUser();
    
    // Si no hay usuario, abortamos para evitar peticiones mal formadas (404)
    if (!me || !me.id) return;

    const myId = Number(me.id);

    forkJoin({
      users: this.userService.getUsers(),
      events: this.eventService.getEvents()
    }).subscribe({
      next: ({ users, events }) => {
        // CORRECCIÓN IMAGEN 7: Usamos carer_id (con guion bajo)
        // Usamos 'any' para evitar que TypeScript bloquee la compilación
        const myUsers = users.filter((u: any) => Number(u.carer_id) === myId);
        this.assignedUsers.set(myUsers);

        const myUserIds = myUsers.map((u: any) => u.id);

        // Filtramos alertas de los pacientes de Manolo
        const myEvents = events.filter((e: any) => 
          myUserIds.includes(e.user_id) && e.fall_detected
        );
        
        // Sincronizamos con los datos reales del SQL
        this.recentAlerts.set([...myEvents].reverse().slice(0, 5));

        this.stats.set({
          total: myUsers.length, // Debería marcar 3
          critical: myEvents.filter((e: any) => e.confirmed === null).length,
          active: myUsers.length
        });
      },
      error: (err) => console.error('Error en Dashboard:', err)
    });
  }
}