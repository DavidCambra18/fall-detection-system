import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { DeviceService } from '../../../core/services/device.service';
import { forkJoin } from 'rxjs';

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
    // Traemos los pacientes y luego buscamos sus dispositivos
    this.userService.getUsersCaredByCarer(carerId).subscribe({
      next: (users) => {
        // Para cada usuario, intentamos asociar su dispositivo (si existe)
        const userWithDeviceObs = users.map(user => 
          this.deviceService.getDeviceByUserId(user.id)
        );

        // Si no hay usuarios, paramos carga
        if (users.length === 0) {
          this.allUsers.set([]);
          this.isLoading.set(false);
          return;
        }

        // ForkJoin para traer la info de hardware de todos a la vez
        forkJoin(userWithDeviceObs).subscribe({
          next: (devices) => {
            const enrichedUsers = users.map((user, index) => ({
              ...user,
              device: devices[index]?.device_id_logic || 'Sin Hardware',
              status: devices[index]?.status || 'Inactivo',
              // Simulamos última conexión basándonos en el status
              lastConnect: devices[index]?.status === 'active' ? 'Online' : 'Desconectado'
            }));
            this.allUsers.set(enrichedUsers);
            this.isLoading.set(false);
          },
          error: () => {
            // Si falla la carga de dispositivos, mostramos al menos los usuarios
            this.allUsers.set(users.map(u => ({...u, device: '?', status: 'Inactivo'})));
            this.isLoading.set(false);
          }
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  verHistorial(userId: number) {
    this.router.navigate(['/history-cuidador', userId]);
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
    const data = this.allUsers().filter(u => u.name.toLowerCase().includes(this.searchTerm().toLowerCase()));
    return Math.ceil(data.length / this.pageSize) || 1;
  });

  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
}