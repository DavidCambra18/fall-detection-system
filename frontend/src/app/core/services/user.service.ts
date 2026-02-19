import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  /**
   * Identifica al usuario por su Token (Sesión actual)
   */
  getUserMe(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`);
  }

  /**
   * Obtiene la lista completa de usuarios (Solo Admin)
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  /**
   * Obtiene los pacientes asignados a un cuidador específico
   */
  getUsersCaredByCarer(carerId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/cared`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}