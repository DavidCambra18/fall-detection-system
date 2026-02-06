import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../core/services/event.service';
import { Device } from '../../core/models/device.models';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
  private eventService = inject(EventService);
  devices = signal<Device[]>([]);

  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
    this.eventService.getEvents().subscribe(events => {
      // Agrupamos los eventos por device_id para sacar el estado del dispositivo
      const deviceMap = new Map<number, Device>();

      events.forEach(e => {
        if (!deviceMap.has(e.device_id)) {
          deviceMap.set(e.device_id, {
            id: e.device_id,
            user_id: e.user_id,
            user_name: e.user_name,
            model: 'MPU6050 v1',
            // Lógica simulada de batería (puedes ajustarla si el sensor la envía)
            battery: Math.floor(Math.random() * (100 - 20 + 1)) + 20, 
            status: 'online',
            last_connection: e.date_rep
          });
        }
      });
      this.devices.set(Array.from(deviceMap.values()));
    });
  }
}