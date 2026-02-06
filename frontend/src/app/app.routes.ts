import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersComponent } from './features/users/users.component';
import { AlertsComponent } from './features/alerts/alerts.component'; // Importamos el nuevo componente
import { authGuard } from './core/guards/auth-guard';
import { DevicesComponent } from './features/devices/devices.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'users', 
    component: UsersComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'devices', 
    component: DevicesComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'history', 
    component: AlertsComponent, 
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];