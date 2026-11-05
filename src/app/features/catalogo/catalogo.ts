import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Producto } from '../../core/models';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { DescuentoService } from '../../core/descuento/descuento.service';
import { NotificationService } from '../../core/services/notification.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { SectionHeader } from '../../shared/components/section-header/section-header';

@Component({
  selector: 'app-catalogo',
  imports: [MatButtonModule, MatChipsModule, MatIconModule, MatProgressBarModule, ProductCard, SectionHeader, EmptyState],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
  host: { id: 'catalogo' },
})
export class Catalogo {
  protected readonly catalogo = inject(CatalogService);
  protected readonly descuento = inject(DescuentoService);
  private readonly carrito = inject(CartService);
  private readonly notificar = inject(NotificationService);

  agregar(producto: Producto) {
    if (this.carrito.agregar(producto)) this.notificar.mostrar(`"${producto.nombre}" agregado al pedido`);
  }
}
