import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Device {
  id: number;
  device_id_logic: string;
  mac: string;
  alias: string;
  status: 'inactive' | 'active' | 'low battery';
  user_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/devices`; // Ajusta según tu backend

  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(this.apiUrl);
  }

  getDeviceByUserId(userId: number): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/user/${userId}`);
  }
}