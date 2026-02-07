import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth-guard';

// DASHBOARDS
import { DashboardComponent } from './features/dashboards/admin-dashboard/dashboard.component'; 
import { CuidadorDashboardComponent } from './features/dashboards/cuidador-dashboard/cuidador-dashboard.component'; 
import { UsuarioDashboardComponent } from './features/dashboards/usuario-dashboard/usuario-dashboard.component'; // IMPORTADO

// ALERTAS / HISTORIAL
import { AlertsComponent } from './features/alerts/admin-alerts/alerts.component';
import { CuidadorAlertsComponent } from './features/alerts/cuidador-alerts/cuidador-alerts.component';
import { UsuarioAlertsComponent } from './features/alerts/usuario-alerts/usuario-alerts.component'; // IMPORTADO

// GESTIÓN DE USUARIOS / PERFIL
import { UsersComponent } from './features/users/admin-users/users.component';
import { MisUsuariosComponent } from './features/users/cuidador-users/mis-usuarios.component';
import { UsuarioUsersComponent } from './features/users/usuario-users/usuario-users.component'; // IMPORTADO

// DISPOSITIVOS
import { DevicesComponent } from './features/devices/devices.component';

export const routes: Routes = [
  // 1. Ruta de entrada
  { path: 'login', component: LoginComponent },

  // 2. Rutas de Dashboard
  { path: 'admin-dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'cuidador-dashboard', component: CuidadorDashboardComponent, canActivate: [authGuard] },
  { path: 'usuario-dashboard', component: UsuarioDashboardComponent, canActivate: [authGuard] }, // ACTIVADO

  // 3. Rutas de Historial / Seguimiento
  { path: 'history-admin', component: AlertsComponent, canActivate: [authGuard] },
  
  // Rutas Cuidador
  { path: 'history-cuidador', component: CuidadorAlertsComponent, canActivate: [authGuard] },
  { path: 'history-cuidador/:userId', component: CuidadorAlertsComponent, canActivate: [authGuard] },
  
  // Rutas Marta (Usuario Rol 3)
  { path: 'usuario-alerts', component: UsuarioAlertsComponent, canActivate: [authGuard] }, 

  // 4. Rutas de Gestión y Perfil
  { path: 'users', component: UsersComponent, canActivate: [authGuard] }, 
  { path: 'mis-usuarios', component: MisUsuariosComponent, canActivate: [authGuard] }, 
  { path: 'usuario-perfil', component: UsuarioUsersComponent, canActivate: [authGuard] }, // NUEVA
  
  // 5. Gestión de Hardware
  { path: 'devices', component: DevicesComponent, canActivate: [authGuard] },

  // 6. Redirecciones y Comodín
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];