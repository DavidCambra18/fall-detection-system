import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth-guard';

// DASHBOARDS
import { DashboardComponent } from './features/dashboards/admin-dashboard/dashboard.component'; 
import { CuidadorDashboardComponent } from './features/dashboards/cuidador-dashboard/cuidador-dashboard.component'; 

// ALERTAS / HISTORIAL
import { AlertsComponent } from './features/alerts/admin-alerts/alerts.component';
import { CuidadorAlertsComponent } from './features/alerts/cuidador-alerts/cuidador-alerts.component';

// GESTIÓN DE USUARIOS (Estructura de carpetas padre)
import { UsersComponent } from './features/users/admin-users/users.component';
import { MisUsuariosComponent } from './features/users/cuidador-users/mis-usuarios.component'; // <-- Nueva importación

// DISPOSITIVOS
import { DevicesComponent } from './features/devices/devices.component';

export const routes: Routes = [
  // 1. Ruta de entrada
  { path: 'login', component: LoginComponent },

  // 2. Rutas de Dashboard (Vistas principales por rol)
  { path: 'admin-dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'cuidador-dashboard', component: CuidadorDashboardComponent, canActivate: [authGuard] },
  // { path: 'usuario-dashboard', component: UsuarioDashboardComponent, canActivate: [authGuard] }, // Futuro Rol 3

  // 3. Rutas de Historial / Seguimiento
  { path: 'history-admin', component: AlertsComponent, canActivate: [authGuard] },
  { path: 'history-cuidador', component: CuidadorAlertsComponent, canActivate: [authGuard] },

  // 4. Rutas de Gestión (Organizadas por carpeta 'users')
  { path: 'users', component: UsersComponent, canActivate: [authGuard] }, // Gestión Admin
  { path: 'mis-usuarios', component: MisUsuariosComponent, canActivate: [authGuard] }, // Gestión Cuidador (Tabla 10 max)
  
  // 5. Gestión de Hardware
  { path: 'devices', component: DevicesComponent, canActivate: [authGuard] },

  // 6. Redirecciones y Comodín
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];