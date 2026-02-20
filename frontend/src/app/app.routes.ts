import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { authGuard } from './core/guards/auth-guard';

// DASHBOARDS
import { DashboardComponent } from './features/dashboards/admin-dashboard/dashboard.component'; 
import { CuidadorDashboardComponent } from './features/dashboards/cuidador-dashboard/cuidador-dashboard.component'; 
import { UsuarioDashboardComponent } from './features/dashboards/usuario-dashboard/usuario-dashboard.component'; 

// ALERTAS / SEGUIMIENTO
import { AlertsComponent } from './features/alerts/admin-alerts/alerts.component';
import { CuidadorAlertsComponent } from './features/alerts/cuidador-alerts/cuidador-alerts.component';
import { UsuarioAlertsComponent } from './features/alerts/usuario-alerts/usuario-alerts.component'; 

// GESTIÓN
import { UsersComponent } from './features/users/admin-users/users.component';
import { MisUsuariosComponent } from './features/users/cuidador-users/mis-usuarios.component';
import { UsuarioUsersComponent } from './features/users/usuario-users/usuario-users.component'; 

// DISPOSITIVOS
import { DevicesComponent } from './features/devices/devices.component';
import { WelcomeComponent } from './features/welcome/welcome';

export const routes: Routes = [

  { path: '', component: WelcomeComponent }, // Página de inicio vacía
  { path: 'login', component: LoginComponent },

  // Rutas Públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // --- ZONA ADMINISTRADOR (ROL 1) ---
  { 
    path: 'admin-dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: [1] } 
  },
  { 
    path: 'users', 
    component: UsersComponent, 
    canActivate: [authGuard], 
    data: { roles: [1] } 
  },
  { 
    path: 'devices', 
    component: DevicesComponent, 
    canActivate: [authGuard], 
    data: { roles: [1] } 
  },
  { 
    path: 'history-admin', 
    component: AlertsComponent, 
    canActivate: [authGuard], 
    data: { roles: [1] } 
  },

  // --- ZONA CUIDADOR (ROL 2) ---
  { 
    path: 'cuidador-dashboard', 
    component: CuidadorDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: [2] } 
  },
  { 
    path: 'mis-usuarios', 
    component: MisUsuariosComponent, 
    canActivate: [authGuard], 
    data: { roles: [2] } 
  }, 
  { 
    path: 'history-cuidador', 
    component: CuidadorAlertsComponent, 
    canActivate: [authGuard], 
    data: { roles: [2] } 
  },
  { 
    path: 'history-cuidador/:userId', 
    component: CuidadorAlertsComponent, 
    canActivate: [authGuard], 
    data: { roles: [2] } 
  },

  // --- ZONA USUARIO FINAL (ROL 3) ---
  { 
    path: 'usuario-dashboard', 
    component: UsuarioDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: [3] } 
  },
  { 
    path: 'usuario-alerts', 
    component: UsuarioAlertsComponent, 
    canActivate: [authGuard], 
    data: { roles: [3] } 
  }, 
  { 
    path: 'usuario-users', 
    component: UsuarioUsersComponent, 
    canActivate: [authGuard], 
    data: { roles: [3] } 
  },

  // Redirecciones por defecto
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];