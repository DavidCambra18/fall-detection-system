import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth-guard';

// DASHBOARDS
import { DashboardComponent } from './features/dashboards/admin-dashboard/dashboard.component'; 
import { CuidadorDashboardComponent } from './features/dashboards/cuidador-dashboard/cuidador-dashboard.component'; 

// ALERTAS
import { AlertsComponent } from './features/alerts/admin-alerts/alerts.component';
import { CuidadorAlertsComponent } from './features/alerts/cuidador-alerts/cuidador-alerts.component';

// GESTIÓN
import { UsersComponent } from './features/users/users.component';
import { DevicesComponent } from './features/devices/devices.component';

export const routes: Routes = [
  // 1. Ruta de entrada
  { path: 'login', component: LoginComponent },

  // 2. Rutas de Dashboard
  { path: 'admin-dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'cuidador-dashboard', component: CuidadorDashboardComponent, canActivate: [authGuard] },
  { path: 'mis-pacientes', component: CuidadorDashboardComponent, canActivate: [authGuard] },

  // 3. Rutas de Historial (Verifica que estos nombres sean los que usas en el Sidebar)
  { path: 'history-admin', component: AlertsComponent, canActivate: [authGuard] },
  { path: 'history-cuidador', component: CuidadorAlertsComponent, canActivate: [authGuard] },

  // 4. Rutas de Gestión
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'devices', component: DevicesComponent, canActivate: [authGuard] },

  // 5. Redirecciones y Comodín (SIEMPRE AL FINAL)
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];