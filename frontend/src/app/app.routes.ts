import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component'; // Quitamos .component para seguir tu estándar
import { DashboardComponent } from './features/dashboard/dashboard';
import { UsersComponent } from './features/users/users';
import { authGuard } from './core/guards/auth-guard';

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
    component: DashboardComponent, // Volvemos a Dashboard temporalmente hasta crear el componente
    canActivate: [authGuard] 
  },
  { 
    path: 'history', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];