import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { Report } from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/events`;

  /**
   * Obtiene todo el historial de eventos.
   */
  getEvents(): Observable<Report[]> {
    return this.http.get<Report[]>(this.API_URL);
  }

  /**
   * Obtiene las alertas pendientes de confirmación.
   * Útil para alimentar un Signal en el Dashboard que controle el parpadeo de alerta.
   */
  getPendingEvents(): Observable<Report[]> {
    return this.getEvents().pipe(
      map(events => events.filter(e => e.confirmed === null && e.fall_detected === true))
    );
  }

  /**
   * Confirma o rechaza una alerta de caída.
   * confirmed: true (Falsa alarma), false (Caída Real), null (Pendiente)
   */
  confirmEvent(id: number, confirmed: boolean | null): Observable<Report> {
    return this.http.patch<Report>(`${this.API_URL}/${id}/confirm`, { confirmed });
  }

  /**
   * Obtiene eventos específicos de un usuario (para la vista del Cuidador).
   */
  getEventsByUserId(userId: number): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.API_URL}/user/${userId}`);
  }
}