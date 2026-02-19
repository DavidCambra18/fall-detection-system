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
  private readonly API_URL = `${environment.apiUrl}/auth`;

  // --- ESTADO PRIVADO (SOLO EL SERVICIO LO CAMBIA) ---
  private _currentUser = signal<User | null>(this.getUserFromStorage());
  private _token = signal<string | null>(localStorage.getItem('token'));

  // --- EXPOSICIÓN PÚBLICA (LECTURA) ---
  // Ahora el guard y el interceptor acceden a estos
  currentUser = this._currentUser.asReadonly();
  token = this._token.asReadonly();

  // DERIVADOS (COMPUTED)
  // Se actualizan automáticamente cuando el usuario cambia
  isLoggedIn = computed(() => !!this._currentUser());
  userRole = computed(() => Number(this._currentUser()?.role_id) ?? null);

  // NUEVO: Signals de conveniencia para roles
  isAdmin = computed(() => this.userRole() === 1);
  isCuidador = computed(() => this.userRole() === 2);
  isPaciente = computed(() => this.userRole() === 3);

  // --- MÉTODOS ---

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  login(credentials: LoginInput): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  // --- LOGIN CON GOOGLE ---
  loginWithGoogle(googleToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/google-login`, { idToken: googleToken }).pipe(
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._currentUser.set(null);
  }

  updateCurrentUserSignal(updatedData: Partial<User>): void {
    const current = this._currentUser();
    if (current) {
      const newUser = { ...current, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      this._currentUser.set(newUser);
    }
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this._token.set(token);
    this._currentUser.set(user);
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