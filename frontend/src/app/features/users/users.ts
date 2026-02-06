import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);

  // Datos originales y filtrados
  users: User[] = [];
  filteredUsers: User[] = [];
  
  // Estado de la tabla
  searchTerm: string = '';
  sortAsc: boolean = true;
  currentPage: number = 1;
  pageSize: number = 10;

  // Estado del modal
  isModalOpen = false;
  selectedUser: Partial<User> = {};

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data: any) => {
        // Validación para manejar arrays directos o envueltos
        if (Array.isArray(data)) {
          this.users = data;
        } else if (data && data.users && Array.isArray(data.users)) {
          this.users = data.users;
        } else {
          this.users = [];
        }
        this.applyFilters();
      },
      error: (err) => console.error('Error al conectar con el backend:', err)
    });
  }

  applyFilters() {
    const search = this.searchTerm.toLowerCase().trim();
    
    // Filtrado multicanal: nombre, apellidos, email y ahora teléfono
    let result = this.users.filter(u => 
      u.name?.toLowerCase().includes(search) ||
      u.surnames?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.phone_num?.includes(search)
    );

    // Ordenación alfabética
    result.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return this.sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    this.filteredUsers = result;
    this.currentPage = 1; 
  }

  // Getters para paginación
  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  // Lógica de Modal con campos del init.sql
  openEditModal(user: User) {
    // Creamos copia para no modificar la referencia de la tabla antes de guardar
    this.selectedUser = { ...user };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = {};
  }

  saveUser() {
    if (this.selectedUser.id) {
      this.userService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error al borrar:', err)
      });
    }
  }

  toggleSort() {
    this.sortAsc = !this.sortAsc;
    this.applyFilters();
  }

  /**
   * Mapeo de roles basado exactamente en tu init.sql:
   * 1: Admin
   * 2: Cuidador
   * 3: Usuario (Paciente)
   */
  getRoleName(role_id?: number): string {
    const roles: { [key: number]: string } = { 
      1: 'Admin', 
      2: 'Cuidador', 
      3: 'Usuario' 
    };
    return roles[role_id || 0] || 'Sin Rol';
  }
}