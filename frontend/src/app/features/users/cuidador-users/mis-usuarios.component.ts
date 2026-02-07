import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cuidador-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-usuarios.component.html'
})
export class MisUsuariosComponent implements OnInit {
  public authService = inject(AuthService);

  // Lista de usuarios asignados (Simulada hasta conectar con API)
  allUsers = signal<any[]>([
    { id: 3, name: 'Marta García', email: 'marta@gmail.com', device: 'ESP32-V1', status: 'Activo' },
    { id: 4, name: 'Roberto Soler', email: 'roberto@gmail.com', device: 'ESP32-V2', status: 'Activo' },
    { id: 5, name: 'Ana Martínez', email: 'ana@gmail.com', device: 'ESP32-V1', status: 'Inactivo' }
  ]);

  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = 10; // Máximo de 10 por página

  ngOnInit() {}

  // Lógica del buscador y paginación
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.allUsers().filter(u => 
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );

    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  });

  totalPages = computed(() => {
    const data = this.allUsers().filter(u => 
      u.name.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
    return Math.ceil(data.length / this.pageSize) || 1;
  });

  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
}