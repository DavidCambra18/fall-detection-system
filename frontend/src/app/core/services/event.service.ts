import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Report } from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/events`;

  getEvents(): Observable<Report[]> {
    return this.http.get<Report[]>(this.API_URL);
  }

  // PATCH para cambiar solo el estado de confirmación
  confirmEvent(id: number, confirmed: boolean): Observable<Report> {
    return this.http.patch<Report>(`${this.API_URL}/${id}/confirm`, { confirmed });
  }
}