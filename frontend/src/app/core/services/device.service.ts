import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Device {
  id: number;
  device_id_logic: string;
  mac: string;
  alias: string;
  status: 'inactive' | 'active' | 'low battery';
  user_id: number | null;
}

interface DeviceResponse {
  message: string;
  device: Device;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/devices`;

  // OPCIONAL: Podemos tener una señal para el conteo global de dispositivos activos
  // Esto es muy útil para mostrar contadores en el Dashboard sin volver a llamar a la API
  // devices = signal<Device[]>([]);

  // Obtener todos los dispositivos
  getDevices(): Observable<Device[]> {
    // Ya no necesitas 'headers'. El authInterceptor se encarga de eso por ti.
    return this.http.get<Device[]>(this.apiUrl);
  }

  // Crear un nuevo dispositivo
  createDevice(deviceData: Partial<Device>): Observable<Device> {
    return this.http.post<DeviceResponse>(this.apiUrl, deviceData)
      .pipe(map(res => res.device));
  }

  // Actualizar dispositivo
  updateDevice(id: number, deviceData: Partial<Device>): Observable<Device> {
    return this.http.put<DeviceResponse>(`${this.apiUrl}/${id}`, deviceData)
      .pipe(map(res => res.device));
  }

  // Borrar dispositivo
  deleteDevice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getDeviceByUserId(userId: number): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/user/${userId}`);
  }
}