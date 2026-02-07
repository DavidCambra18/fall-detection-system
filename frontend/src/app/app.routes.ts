import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/admin-dashboard/dashboard.component'; 
import { CuidadorDashboardComponent } from './features/cuidador-dashboard/cuidador-dashboard.component'; 
import { UsersComponent } from './features/users/users.component';
import { AlertsComponent } from './features/alerts/alerts.component';
import { authGuard } from './core/guards/auth-guard';
import { DevicesComponent } from './features/devices/devices.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // RUTA PARA ADMIN (Rol 1)
  { 
    path: 'admin-dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },

  // RUTA PARA CUIDADOR (Rol 2)
  { 
    path: 'cuidador-dashboard', 
    component: CuidadorDashboardComponent, 
    canActivate: [authGuard] 
  },

/*   // RUTA PARA USUARIO (Rol 3)
  { 
    path: 'usuario-dashboard', 
    component: UsuarioDashboardComponent, 
    canActivate: [authGuard] 
  }, */

  // Gestión y Seguimiento
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

  // Redirecciones
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];