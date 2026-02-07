import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService, Device } from '../../core/services/device.service';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
  private deviceService = inject(DeviceService);
  
  // Signal para la lista de dispositivos reales
  devices = signal<Device[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices() {
    this.deviceService.getDevices().subscribe({
      next: (data) => {
        this.devices.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al conectar con el inventario:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Lógica visual para la batería (puedes simularla o traerla si el back la incluye)
  getBatteryClass(level: number = 0): string {
    if (level > 50) return 'bg-emerald-500';
    if (level > 20) return 'bg-amber-500';
    return 'bg-red-500';
  }
}