import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router'; // Importa Router y NavigationEnd
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  template: `
    <div class="flex h-screen bg-slate-50 overflow-hidden">
      <app-sidebar *ngIf="isLoggedIn && !isLoginPage"></app-sidebar>
      
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = false;
  isLoginPage = false;

  constructor() {
    // Escuchamos los cambios de ruta para decidir si mostrar el Sidebar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoggedIn = this.authService.isLoggedIn();
      this.isLoginPage = event.url === '/login' || event.url === '/';
    });
  }
}