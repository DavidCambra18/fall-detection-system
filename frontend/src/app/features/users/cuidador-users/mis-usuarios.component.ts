import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { DeviceService } from '../../../core/services/device.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-cuidador-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-usuarios.component.html'
})
export class MisUsuariosComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private deviceService = inject(DeviceService);
  public authService = inject(AuthService);

  allUsers = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = 8;

  ngOnInit(): void {
    this.loadMyPatients();
  }

  loadMyPatients() {
    const carerId = this.authService.currentUser()?.id;
    if (!carerId) return;

    this.isLoading.set(true);
    
    // 1. Cargamos pacientes y dispositivos al mismo tiempo
    forkJoin({
      patients: this.userService.getUsersCaredByCarer(carerId),
      devices: this.deviceService.getDevices() // Usamos la lista general que ya funciona
    }).pipe(
      catchError(err => {
        console.error('Error cargando datos del cuidador:', err);
        return of({ patients: [], devices: [] });
      })
    ).subscribe({
      next: ({ patients, devices }) => {
        // 2. Cruzamos los datos en el frontend
        const enrichedUsers = patients.map(patient => {
          // Buscamos el dispositivo cuyo user_id coincida con el id del paciente
          const deviceMatch = devices.find(d => Number(d.user_id) === Number(patient.id));
          
          return {
            ...patient,
            // Si hay coincidencia, usamos el ID lógico, si no, mostramos "NO VINCULADO"
            device: deviceMatch ? deviceMatch.device_id_logic : 'NO VINCULADO',
            status: deviceMatch ? deviceMatch.status : 'inactive',
            lastConnect: deviceMatch?.status === 'active' ? 'En línea' : 'Desconectado'
          };
        });
        
        this.allUsers.set(enrichedUsers);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.allUsers().filter(u => 
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  });

  totalPages = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.allUsers().filter(u => 
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
    return Math.ceil(data.length / this.pageSize) || 1;
  });

  verHistorial(userId: number) { 
    this.router.navigate(['/history-cuidador', userId]); 
  }

  nextPage() { 
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); 
  }

  prevPage() { 
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1); 
  }
}