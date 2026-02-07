import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
  
  // Sincronizado con init.sql: Marta (ID 3), Roberto (ID 4), Ana (ID 5)
  devices = signal([
    {
      logic_id: 'ESP32-001',
      mac: 'AA:BB:CC:11:22:33',
      alias: 'Dispositivo de Marta',
      status: 'active',
      battery: 95,
      owner: 'Marta Rövanpera'
    },
    {
      logic_id: 'ESP32-002',
      mac: 'AA:BB:CC:11:22:34',
      alias: 'Dispositivo de Roberto',
      status: 'active',
      battery: 72,
      owner: 'Roberto Gómez Ruiz'
    },
    {
      logic_id: 'ESP32-003',
      mac: 'AA:BB:CC:11:22:35',
      alias: 'Dispositivo de Ana',
      status: 'low battery', // Estado crítico según SQL
      battery: 12,
      owner: 'Ana Sánchez Moreno'
    }
  ]);

  ngOnInit(): void {}

  getBatteryClass(level: number): string {
    if (level > 50) return 'bg-emerald-500';
    if (level > 20) return 'bg-amber-500';
    return 'bg-red-500';
  }
}