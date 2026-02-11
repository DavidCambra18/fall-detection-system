import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs'; // Importamos map para limpiar la respuesta del back
import { environment } from '../../../environments/environment';

export interface Device {
  id: number;
  device_id_logic: string;
  mac: string;
  alias: string;
  status: 'inactive' | 'active' | 'low battery';
  user_id: number | null;
}

// Interfaz para manejar las respuestas envueltas del backend
interface DeviceResponse {
  message: string;
  device: Device;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/devices`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener todos los dispositivos
  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Crear un nuevo dispositivo (POST) [Sincronizado con createDeviceController]
  createDevice(deviceData: Partial<Device>): Observable<Device> {
    return this.http.post<DeviceResponse>(this.apiUrl, deviceData, { headers: this.getHeaders() })
      .pipe(map(res => res.device)); // Extraemos el objeto device de la respuesta
  }

  // Actualizar dispositivo (PUT) [Sincronizado con updateDeviceController]
  updateDevice(id: number, deviceData: Partial<Device>): Observable<Device> {
    return this.http.put<DeviceResponse>(`${this.apiUrl}/${id}`, deviceData, { headers: this.getHeaders() })
      .pipe(map(res => res.device)); // Extraemos el objeto device de la respuesta
  }

  // Borrar dispositivo (DELETE) [Sincronizado con deleteDeviceController]
  deleteDevice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getDeviceByUserId(userId: number): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() });
  }
}