import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../../core/services/auth.service';
import { DeviceService, Device } from '../../../core/services/device.service';
import { UserService } from '../../../core/services/user.service'; 
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-usuario-users',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './usuario-users.component.html'
})
export class UsuarioUsersComponent implements OnInit {
  public authService = inject(AuthService);
  private deviceService = inject(DeviceService);
  private userService = inject(UserService); 
  
  myDevice = signal<Device | null>(null);
  fullUserData = signal<User | null>(null); 
  isEditing = signal<boolean>(false);
  editForm = signal<any>({}); 

  ngOnInit() {
    const userId = this.authService.currentUser()?.id;
    
    if (userId) {
      // 1. CARGAR DATOS REALES USANDO getUserById
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          if (user) {
            // TRUCO: Formatear fecha para que el input HTML tipo 'date' la muestre
            if (user.date_born) {
              user.date_born = new Date(user.date_born).toISOString().split('T')[0];
            }
            this.fullUserData.set(user);
            this.resetForm();
          }
        },
        error: (err) => console.error('Error cargando perfil:', err)
      });

      // 2. CARGAR DISPOSITIVO
      this.deviceService.getDevices().subscribe(devices => {
        const found = devices.find(d => d.user_id === userId);
        this.myDevice.set(found || null);
      });
    }
  }

  resetForm() {
    this.editForm.set({ ...this.fullUserData() });
  }

  toggleEdit() {
    if (this.isEditing()) this.resetForm(); 
    this.isEditing.update(v => !v);
  }

  saveProfile() {
    const userId = this.fullUserData()?.id;
    if (userId) {
      this.userService.updateUser(userId, this.editForm()).subscribe({
        next: () => {
          this.fullUserData.set({ ...this.editForm() });
          this.authService.updateCurrentUserSignal(this.editForm());
          this.isEditing.set(false);
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }
  }
}