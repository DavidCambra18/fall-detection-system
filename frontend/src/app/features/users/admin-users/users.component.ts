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
  selectedUser = signal<Partial<User>>({});

  ngOnInit() {
    this.loadUsers();
  }

  // --- LÓGICA REACTIVA ---
  
  // Filtra los cuidadores disponibles para el selector del modal
  cuidadores = computed(() => 
    this.users().filter(u => u.role_id === 2)
  );

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

  // --- ACCIONES OPERATIVAS ---

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
    
    if (userData.id) {
      this.userService.updateUser(userData.id, userData).subscribe({
        next: () => { 
          this.loadUsers(); 
          this.closeModal(); 
          console.log('Usuario actualizado correctamente');
        },
        error: (err) => alert('Error al actualizar: ' + err.error.message)
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario permanentemente?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          console.log('Usuario borrado');
        },
        error: (err) => alert('Error al borrar: ' + err.error.message)
      });
    }
  }

  // --- HELPERS ---

  openEditModal(user: User) {
    this.selectedUser.set({ ...user });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedUser.set({});
  }

  toggleSort() {
    this.sortAsc.update(val => !val);
  }

  getRoleName(role_id?: number): string {
    const roles: Record<number, string> = { 1: 'Admin', 2: 'Cuidador', 3: 'Usuario' };
    return roles[role_id || 0] || 'Sin Rol';
  }
}