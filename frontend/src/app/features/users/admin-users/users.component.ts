import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);

  // --- SIGNALS DE ESTADO ---
  users = signal<User[]>([]);
  searchTerm = signal<string>('');
  sortAsc = signal<boolean>(true);
  currentPage = signal<number>(1);
  pageSize = 10;

  isModalOpen = signal(false);
  isEditing = signal(false); 
  selectedUser = signal<Partial<User>>({});

  ngOnInit() {
    this.loadUsers();
  }

  // --- LÓGICA REACTIVA ---
  
  filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    let result = this.users().filter(u => 
      u.name?.toLowerCase().includes(search) ||
      u.surnames?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.phone_num?.includes(search)
    );

    result.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return this.sortAsc() ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    return result;
  });

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredUsers().length / this.pageSize) || 1);

  skeletonRows = computed(() => {
    const remaining = this.pageSize - this.paginatedUsers().length;
    return remaining > 0 ? Array(remaining).fill(0) : [];
  });

  // --- ACCIONES ---

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users.set(data);
      },
      error: (err) => console.error('Error Backend:', err)
    });
  }

  saveUser() {
    const userData = this.selectedUser();
    
    if (this.isEditing() && userData.id) {
      this.userService.updateUser(userData.id, userData).subscribe({
        next: () => { this.loadUsers(); this.closeModal(); }
      });
    } else {
      this.userService.createUser(userData as User).subscribe({
        next: () => { this.loadUsers(); this.closeModal(); }
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('¿Seguro?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  // --- HELPERS ---
  
  openCreateModal() {
    this.isEditing.set(false);
    // Cambiado a role_id para coincidir con el backend
    this.selectedUser.set({ 
      role_id: 3, 
      name: '', 
      email: '', 
      surnames: '', 
      phone_num: '' 
    } as any); 
    this.isModalOpen.set(true);
  }

  openEditModal(user: User) {
    this.isEditing.set(true);
    this.selectedUser.set({ ...user });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  toggleSort() {
    this.sortAsc.update(val => !val);
  }

  // Recibe role_id directamente de la base de datos
  getRoleName(role_id?: number): string {
    const roles: Record<number, string> = { 1: 'Admin', 2: 'Cuidador', 3: 'Usuario' };
    return roles[role_id || 0] || 'Sin Rol';
  }
}