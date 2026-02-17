import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatGPTService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/chatgpt`;

  ask(message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ask`, { message });
  }

  analyzeDevice(deviceId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyze/${deviceId}`);
  }

  generateReport(startDate?: string, endDate?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report`, { startDate, endDate });
  }

  getSuggestions(): Observable<any> {
    return this.http.post(`${this.apiUrl}/suggest`, {});
  }
}