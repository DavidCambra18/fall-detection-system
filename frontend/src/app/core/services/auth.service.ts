import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginInput } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  login(credentials: LoginInput): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // localStorage.clear() es un poco agresivo si usas otras keys, 
    // mejor borrar solo lo relacionado con la sesión.
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Corregido para asegurar que devuelve un número y maneja role_id
  getRole(): number | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    // Algunos backends devuelven roleId y otros role_id, cubrimos ambos:
    return Number(user.roleId || user.role_id || null);
  }

  // Helpers de rol para que tu Sidebar sea fácil de leer
  isAdmin(): boolean { return this.getRole() === 1; }
  isCuidador(): boolean { return this.getRole() === 2; }
  isPaciente(): boolean { return this.getRole() === 3; }
}