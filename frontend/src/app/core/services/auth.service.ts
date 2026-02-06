import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginInput, UserSession } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  // Signal que contiene los datos del usuario o null si no está logueado
  currentUser = signal<UserSession | null>(this.getUserFromStorage());

  // Signals derivados para usar en el HTML de forma reactiva
  isLoggedIn = computed(() => !!this.currentUser());
  userRole = computed(() => this.currentUser()?.roleId ?? null);

  login(credentials: LoginInput): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        this.saveSession(res.token, res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  // Métodos de utilidad para validaciones rápidas
  isAdmin(): boolean { return this.userRole() === 1; }
  isCuidador(): boolean { return this.userRole() === 2; }
  isPaciente(): boolean { return this.userRole() === 3; }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private saveSession(token: string, user: UserSession): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user); // Actualizamos el signal
  }

  private getUserFromStorage(): UserSession | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}