import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/layout/shell/shell').then(m => m.Shell),
    children: [
      { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },
    ],
  },
  { path: 'admin/login', loadComponent: () => import('./features/admin/login/login').then(m => m.Login) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/layout').then(m => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
      { path: 'productos', loadComponent: () => import('./features/admin/productos/productos').then(m => m.AdminProductos) },
      { path: 'clientes', loadComponent: () => import('./features/admin/clientes/clientes').then(m => m.AdminClientes) },
      { path: 'novedades', loadComponent: () => import('./features/admin/novedades/novedades').then(m => m.AdminNovedades) },
    ],
  },
  { path: '**', redirectTo: '' },
];
