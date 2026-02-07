import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs'; // Añadimos map para filtrar si es necesario
import { Report } from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/events`;

  getEvents(): Observable<Report[]> {
    return this.http.get<Report[]>(this.API_URL);
  }

  /**
   * NUEVO MÉTODO: Obtiene las alertas pendientes de confirmación.
   * Esto servirá para el aviso parpadeante en tiempo real.
   */
  getPendingEvents(): Observable<Report[]> {
    return this.getEvents().pipe(
      map(events => events.filter(e => e.confirmed === null && e.fall_detected === true))
    );
  }

  /**
   * PATCH para cambiar el estado de confirmación.
   * Usamos boolean | null para permitir todos los estados del SQL.
   */
  confirmEvent(id: number, confirmed: boolean | null): Observable<Report> {
    return this.http.patch<Report>(`${this.API_URL}/${id}/confirm`, { confirmed });
  }
}