import { Component, inject, signal, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { ChatAiComponent } from './shared/components/chat-ai/chat-ai';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  // 🔥 Eliminamos CommonModule. Ahora usamos Control Flow nativo.
  imports: [RouterOutlet, SidebarComponent, ChatAiComponent],
  template: `
    <div class="flex h-screen bg-slate-50 overflow-hidden">
      
      @if (isLoggedIn() && !isLoginPage()) {
        <app-sidebar />
      }
      
      <main class="flex-1 overflow-y-auto relative">
        <router-outlet />

        @if (isLoggedIn()) {
          <app-chat-ai />
        }
      </main>
    </div>
  `
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // 🔥 Usamos Signals para el estado de la UI
  isLoggedIn = signal<boolean>(false);
  isLoginPage = signal<boolean>(false);

  constructor() {
    // Escuchamos los cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Actualizamos los signals
      this.isLoggedIn.set(this.authService.isLoggedIn());
      
      // Comprobamos si estamos en login o raíz
      const url = event.urlAfterRedirects || event.url;
      this.isLoginPage.set(url === '/login' || url === '/');
    });
  }
}