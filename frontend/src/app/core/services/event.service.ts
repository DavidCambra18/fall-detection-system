import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Report } from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  // Usamos una constante para la URL base para evitar errores de concatenación
  private readonly API_URL = `${environment.apiUrl}/events`;

  getEvents(): Observable<Report[]> {
    return this.http.get<Report[]>(this.API_URL);
  }

  /**
   * PATCH para cambiar el estado de confirmación.
   * Usamos boolean | null para permitir todos los estados del SQL.
   */
  confirmEvent(id: number, confirmed: boolean | null): Observable<Report> {
    // Si tu backend usa la ruta específica /confirm, mantenemos esa estructura
    return this.http.patch<Report>(`${this.API_URL}/${id}/confirm`, { confirmed });
  }
}