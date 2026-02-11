import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ENDPOINT CRÍTICO: Identifica al usuario por su Token
  getUserMe(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`, { headers: this.getHeaders() });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL, { headers: this.getHeaders() });
  }

  getUsersCaredByCarer(carerId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/cared`, { headers: this.getHeaders() });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.API_URL, user, { headers: this.getHeaders() });
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }
}