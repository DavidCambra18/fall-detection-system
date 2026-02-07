import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/auth.models'; // <-- Importar desde auth.models

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
  // Usamos User completo para que TypeScript detecte roleId
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
        // El servicio ya devuelve User[], manejamos la asignación directa
        this.users.set(data);
      },
      error: (err) => console.error('Error Backend:', err)
    });
  }

  saveUser() {
    const userData = this.selectedUser();
    
    // Validamos que roleId exista antes de enviar para cumplir con la interfaz
    if (this.isEditing() && userData.id) {
      this.userService.updateUser(userData.id, userData).subscribe({
        next: () => { this.loadUsers(); this.closeModal(); }
      });
    } else {
      // Forzamos el tipado a User asegurando que los campos mínimos están
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
    // Cambiamos role_id por roleId para que coincida con la interfaz
    this.selectedUser.set({ 
      roleId: 3, 
      name: '', 
      email: '', 
      surnames: '', 
      phone_num: '' 
    }); 
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

  getRoleName(roleId?: number): string {
    const roles: Record<number, string> = { 1: 'Admin', 2: 'Cuidador', 3: 'Usuario' };
    return roles[roleId || 0] || 'Sin Rol';
  }
}