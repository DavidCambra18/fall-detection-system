import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common'; // Importamos NgClass específicamente
import { FormsModule } from '@angular/forms';
import { DeviceService, Device } from '../../core/services/device.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/auth.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [FormsModule], // Quitamos CommonModule
  templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
  private deviceService = inject(DeviceService);
  private userService = inject(UserService);
  
  devices = signal<Device[]>([]);
  users = signal<User[]>([]); 
  isLoading = signal<boolean>(true);
  
  isModalOpen = signal(false);
  selectedDevice = signal<Partial<Device>>({
    device_id_logic: '',
    mac: '',
    user_id: undefined,
    status: 'active'
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    forkJoin({
      devices: this.deviceService.getDevices(),
      users: this.userService.getUsers()
    }).subscribe({
      next: (res) => {
        this.devices.set(res.devices);
        // Filtramos para mostrar solo pacientes (Rol 3)
        this.users.set(res.users.filter(u => u.role_id === 3));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al sincronizar datos:', err);
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal() {
    this.selectedDevice.set({ 
      device_id_logic: '', 
      mac: '', 
      user_id: undefined,
      status: 'active' 
    });
    this.isModalOpen.set(true);
  }

  saveDevice() {
    const dev = this.selectedDevice();
    const user = this.users().find(u => u.id === Number(dev.user_id));
    
    if (!user) {
      alert('Error: Debes seleccionar un paciente para el dispositivo.');
      return;
    }

    const deviceToSave = {
      ...dev,
      alias: `Dispositivo de ${user.name}`
    };

    this.deviceService.createDevice(deviceToSave).subscribe({
      next: () => {
        this.loadData();
        this.isModalOpen.set(false);
      },
      error: (err) => alert('Error al registrar: ' + (err.error?.message || 'Error desconocido'))
    });
  }

  deleteDevice(id: number) {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
      this.deviceService.deleteDevice(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Error al eliminar')
      });
    }
  }

  getUserName(userId: number | null): string {
    const user = this.users().find(u => u.id === userId);
    return user ? `${user.name} ${user.surnames || ''}` : `ID: #${userId}`;
  }
}