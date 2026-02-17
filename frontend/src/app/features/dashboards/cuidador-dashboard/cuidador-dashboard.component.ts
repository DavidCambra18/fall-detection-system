import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { NgClass } from '@angular/common'; // Importación quirúrgica
import { RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Report } from '../../../core/models/report.models'; 
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-cuidador-dashboard',
  standalone: true,
  imports: [NgClass, RouterModule], // Quitamos CommonModule
  templateUrl: './cuidador-dashboard.component.html'
})
export class CuidadorDashboardComponent implements OnInit, OnDestroy {
  public eventService = inject(EventService);
  public authService = inject(AuthService);
  private userService = inject(UserService);
  
  private intervalId: any;
  
  public activeAlert = signal<Report | null>(null); 
  public myPatients = signal<User[]>([]);
  public stats = signal({ total: 0, critical: 0, active: 0 });

  ngOnInit() {
    this.loadInitialData();
    // Polling cada 5 segundos
    this.intervalId = setInterval(() => this.refreshData(), 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadInitialData() {
    const user = this.authService.currentUser();
    const carerId = user?.id;
    if (!carerId) return;

    this.userService.getUsersCaredByCarer(carerId).subscribe(users => {
      this.myPatients.set(users);
      this.stats.update(s => ({ ...s, total: users.length, active: users.length }));
      this.refreshData();
    });
  }

  refreshData() {
    const patientIds = this.myPatients().map(p => p.id);
    if (patientIds.length === 0) return;

    this.eventService.getEvents().subscribe({
      next: (events: Report[]) => {
        // Filtramos: Solo de mis pacientes y que tengan el flag de caída/botón activado
        const myEvents = events.filter(e => 
          patientIds.includes(Number(e.user_id)) && e.fall_detected
        );
        
        const emergency = myEvents.find(e => e.confirmed === null);
        
        if (emergency) {
          // Clasificación reactiva
          emergency.isPanicButton = Number(emergency.acc_z) < 1.5;
        }

        this.activeAlert.set(emergency || null);
        
        this.stats.update(s => ({
          ...s,
          critical: myEvents.filter(e => e.confirmed === null).length
        }));
      }
    });
  }

  getPatientName(id: number): string {
    const patient = this.myPatients().find(p => p.id === id);
    return patient ? `${patient.name} ${patient.surnames || ''}` : `Paciente #${id}`;
  }
}