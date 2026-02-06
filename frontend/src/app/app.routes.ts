import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] // <--- Solo entras si estás logueado
  },
  { 
    path: 'devices', 
    component: DashboardComponent, // Temporalmente usamos el dashboard hasta crear el suyo
    canActivate: [authGuard] 
  },
  { 
    path: 'history', 
    component: DashboardComponent, // Temporalmente usamos el dashboard hasta crear el suyo
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];