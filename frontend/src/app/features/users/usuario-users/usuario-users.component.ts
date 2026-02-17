import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../../core/services/auth.service';
import { DeviceService, Device } from '../../../core/services/device.service';
import { UserService } from '../../../core/services/user.service'; 
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-usuario-users',
  standalone: true,
  imports: [FormsModule, DatePipe], 
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
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadProfile();
  }

  // Comprueba si el teléfono es el generado automáticamente por Google (G-...) 
  // o el marcador de posición (PTE-...)
  isPhonePending(): boolean {
    const phone = this.fullUserData()?.phone_num;
    return !!phone && (phone.startsWith('G-') || phone.startsWith('PTE-'));
  }

  loadProfile() {
    this.isLoading.set(true);
    this.userService.getUserMe().subscribe({
      next: (user) => {
        if (user) {
          if (user.date_born) {
            user.date_born = new Date(user.date_born).toISOString().split('T')[0];
          }
          this.fullUserData.set(user);
          this.resetForm();

          this.deviceService.getDevices().subscribe(devices => {
            const found = devices.find(d => d.user_id === user.id);
            this.myDevice.set(found || null);
          });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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
    if (!userId) return;

    this.userService.updateUser(userId, this.editForm()).subscribe({
      next: () => {
        this.fullUserData.set({ ...this.editForm() });
        this.authService.updateCurrentUserSignal(this.editForm());
        this.isEditing.set(false);
      },
      error: (err) => alert('Error al actualizar: ' + err.error.message)
    });
  }
}