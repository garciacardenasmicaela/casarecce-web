import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { BrandMonogram } from '../../../shared/components/brand-monogram/brand-monogram';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatTabsModule, BrandMonogram],
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
