import { Routes } from '@angular/router';
import {authGuard} from "./auth/auth.guard";

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./web-push-dashboard/web-push-dashboard.component').then(m => m.WebPushDashboardComponent),
  },
  {
    path: 'templates',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./templates/templates.component').then(m => m.TemplatesComponent),
  },
  {
    path: 'creator',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./creator/creator.component').then(m => m.CreatorComponent),
  },
  {
    path: 'send/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./send/send.component').then(m => m.SendComponent),
  },
  {
    path: 'send',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./send/send.component').then(m => m.SendComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/components/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent),
  },
];
