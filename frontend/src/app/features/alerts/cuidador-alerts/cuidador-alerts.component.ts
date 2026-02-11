import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-cuidador-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuidador-alerts.component.html'
})
export class CuidadorAlertsComponent implements OnInit {
  private eventService = inject(EventService);
  private userService = inject(UserService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allAlerts = signal<any[]>([]);
  myPatients = signal<any[]>([]); // Cache para nombres reales
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = 10;
  userIdParam = signal<number | null>(null);
  editingId = signal<number | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('userId');
      this.userIdParam.set(id ? Number(id) : null);
      this.currentPage.set(1);
    });

    this.loadInitialData();
  }

  loadInitialData() {
    const carerId = this.authService.currentUser()?.id;
    if (!carerId) return;

    this.isLoading.set(true);
    // Cargamos primero los pacientes para tener sus nombres
    this.userService.getUsersCaredByCarer(carerId).subscribe(users => {
      this.myPatients.set(users);
      this.loadHistory();
    });
  }

  loadHistory() {
    this.eventService.getEvents().subscribe(events => {
      const patientIds = this.myPatients().map(p => p.id);
      // Filtramos solo eventos de MIS pacientes reales
      const filtered = events.filter(e => 
        patientIds.includes(Number(e.user_id)) && e.fall_detected === true
      );
      this.allAlerts.set(filtered.reverse());
      this.isLoading.set(false);
    });
  }

  filteredAlerts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filterId = this.userIdParam();
    let data = this.allAlerts();

    if (filterId) data = data.filter(a => Number(a.user_id) === filterId);
    if (term) {
      data = data.filter(a => 
        this.formatPatientName(a.user_id).toLowerCase().includes(term)
      );
    }

    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  });

  totalPages = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filterId = this.userIdParam();
    let data = this.allAlerts();
    if (filterId) data = data.filter(a => Number(a.user_id) === filterId);
    if (term) data = data.filter(a => this.formatPatientName(a.user_id).toLowerCase().includes(term));
    return Math.ceil(data.length / this.pageSize) || 1;
  });

  formatPatientName(id: number): string {
    const patient = this.myPatients().find(p => p.id === id);
    return patient ? `${patient.name} ${patient.surnames || ''}` : `ID: #${id}`;
  }

  clearFilter() { this.router.navigate(['/history-cuidador']); }
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