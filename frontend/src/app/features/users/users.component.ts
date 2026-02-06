import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  filteredUsers: User[] = [];
  
  searchTerm: string = '';
  sortAsc: boolean = true;
  currentPage: number = 1;
  pageSize: number = 10;

  // Estado del Modal/Formulario
  isModalOpen = false;
  isEditing = false; 
  selectedUser: Partial<User> = {};

  ngOnInit() {
    this.loadUsers();
  }

  // Getter para generar las filas vacías que faltan hasta llegar a 10
  get skeletonRows() {
    const currentCount = this.paginatedUsers.length;
    const remaining = this.pageSize - currentCount;
    return remaining > 0 ? Array(remaining).fill(0) : [];
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data: any) => {
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
    
    let result = this.users.filter(u => 
      u.name?.toLowerCase().includes(search) ||
      u.surnames?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.phone_num?.includes(search)
    );

    result.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return this.sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    this.filteredUsers = result;
    this.currentPage = 1; 
  }

  openCreateModal() {
    this.isEditing = false;
    // Forzamos el tipo a User para evitar error con 'password'
    this.selectedUser = {
      role_id: 3,
      name: '',
      surnames: '',
      email: '',
      password: '',
      phone_num: ''
    } as User; 
    this.isModalOpen = true;
  }

  openEditModal(user: User) {
    this.isEditing = true;
    this.selectedUser = { ...user };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = {};
  }

  saveUser() {
    if (this.isEditing && this.selectedUser.id) {
      this.userService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.userService.createUser(this.selectedUser as User).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => console.error('Error al crear usuario:', err)
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

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  toggleSort() {
    this.sortAsc = !this.sortAsc;
    this.applyFilters();
  }

  getRoleName(role_id?: number): string {
    const roles: { [key: number]: string } = { 1: 'Admin', 2: 'Cuidador', 3: 'Usuario' };
    return roles[role_id || 0] || 'Sin Rol';
  }
}