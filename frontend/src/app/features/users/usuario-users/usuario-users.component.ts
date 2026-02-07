import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { DeviceService, Device } from '../../../core/services/device.service';

@Component({
  selector: 'app-usuario-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-users.component.html'
})
export class UsuarioUsersComponent implements OnInit {
  public authService = inject(AuthService);
  private deviceService = inject(DeviceService);
  
  myDevice = signal<Device | null>(null);

  ngOnInit() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      // Cargamos el dispositivo vinculado al usuario logueado
      this.deviceService.getDevices().subscribe(devices => {
        const found = devices.find(d => d.user_id === userId);
        this.myDevice.set(found || null);
      });
    }
  }
}