import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { BrandLogo } from '../../../shared/components/brand-logo/brand-logo';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, BrandLogo],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class AdminLayout {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected readonly pestanas = [
    { ruta: 'productos', texto: 'Stock y Precios', icono: 'inventory_2' },
    { ruta: 'clientes', texto: 'Clientes', icono: 'groups' },
    { ruta: 'novedades', texto: 'Novedades', icono: 'campaign' },
  ];

  async salir() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
