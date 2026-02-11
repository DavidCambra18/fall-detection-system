import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { authGuard } from './core/guards/auth-guard';

import { DashboardComponent } from './features/dashboards/admin-dashboard/dashboard.component'; 
import { CuidadorDashboardComponent } from './features/dashboards/cuidador-dashboard/cuidador-dashboard.component'; 
import { UsuarioDashboardComponent } from './features/dashboards/usuario-dashboard/usuario-dashboard.component'; 

import { AlertsComponent } from './features/alerts/admin-alerts/alerts.component';
import { CuidadorAlertsComponent } from './features/alerts/cuidador-alerts/cuidador-alerts.component';
import { UsuarioAlertsComponent } from './features/alerts/usuario-alerts/usuario-alerts.component'; 

import { UsersComponent } from './features/users/admin-users/users.component';
import { MisUsuariosComponent } from './features/users/cuidador-users/mis-usuarios.component';
import { UsuarioUsersComponent } from './features/users/usuario-users/usuario-users.component'; 

import { DevicesComponent } from './features/devices/devices.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Dashboards protegidos
  { path: 'admin-dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'cuidador-dashboard', component: CuidadorDashboardComponent, canActivate: [authGuard] },
  { path: 'usuario-dashboard', component: UsuarioDashboardComponent, canActivate: [authGuard] },

  // Alertas / Seguimiento
  { path: 'history-admin', component: AlertsComponent, canActivate: [authGuard] },
  { path: 'history-cuidador', component: CuidadorAlertsComponent, canActivate: [authGuard] },
  { path: 'history-cuidador/:userId', component: CuidadorAlertsComponent, canActivate: [authGuard] },
  { path: 'usuario-alerts', component: UsuarioAlertsComponent, canActivate: [authGuard] }, 

  // Gestión
  { path: 'users', component: UsersComponent, canActivate: [authGuard] }, 
  { path: 'mis-usuarios', component: MisUsuariosComponent, canActivate: [authGuard] }, 
  
  // RUTA CORREGIDA: Sincronizada con Sidebar
  { path: 'usuario-users', component: UsuarioUsersComponent, canActivate: [authGuard] },
  
  { path: 'devices', component: DevicesComponent, canActivate: [authGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];