import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginInput, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // Asegúrate de que environment.apiUrl sea 'http://localhost:3000/api'
  private readonly API_URL = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(this.getUserFromStorage());
  isLoggedIn = computed(() => !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role_id ?? null);

  // --- NUEVO MÉTODO DE REGISTRO ---
  register(userData: any): Observable<any> {
    // Esto envía name, email, password, phone_num, etc., al backend
    return this.http.post(`${this.API_URL}/register`, userData);
  }

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

  // Métodos de utilidad para roles
  isAdmin(): boolean { return this.userRole() === 1; }
  isCuidador(): boolean { return this.userRole() === 2; }
  isPaciente(): boolean { return this.userRole() === 3; }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  updateCurrentUserSignal(updatedData: Partial<User>): void {
    const current = this.currentUser();
    if (current) {
      const newUser = { ...current, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      this.currentUser.set(newUser);
    }
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }
}