import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
  
  // Datos reales extraídos de tu init.sql
  devices = signal([
    {
      logic_id: 'ESP32-001',
      mac: 'AA:BB:CC:11:22:33',
      alias: 'Dispositivo de Marta',
      status: 'active',
      battery: 95,
      owner: 'Marta Rövanpera',
      userId: 3
    },
    {
      logic_id: 'ESP32-002',
      mac: 'AA:BB:CC:11:22:34',
      alias: 'Dispositivo de Roberto',
      status: 'active',
      battery: 72,
      owner: 'Roberto Gómez Ruiz',
      userId: 4
    },
    {
      logic_id: 'ESP32-003',
      mac: 'AA:BB:CC:11:22:35',
      alias: 'Dispositivo de Ana',
      status: 'low battery',
      battery: 15, // Reflejamos el estado 'low battery' del SQL
      owner: 'Ana Sánchez Moreno',
      userId: 5
    }
  ]);

  ngOnInit(): void {}

  // Función para determinar el color de la batería visualmente
  getBatteryClass(level: number): string {
    if (level > 50) return 'bg-emerald-500';
    if (level > 20) return 'bg-amber-500';
    return 'bg-red-500';
  }
}