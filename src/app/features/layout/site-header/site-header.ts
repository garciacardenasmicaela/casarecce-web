import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { DescuentoService } from '../../../core/descuento/descuento.service';
import { DialogsService } from '../../../core/services/dialogs.service';
import { BrandLogo } from '../../../shared/components/brand-logo/brand-logo';

@Component({
  selector: 'app-site-header',
  imports: [MatBadgeModule, MatDividerModule, MatMenuModule, MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, BrandLogo],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly cart = inject(CartService);
  protected readonly dialogs = inject(DialogsService);
  protected readonly descuento = inject(DescuentoService);

  /** Celular: menos de 768px. Ahí solo quedan el logo y la hamburguesa. */
  protected readonly esMovil = toSignal(
    inject(BreakpointObserver).observe('(max-width: 767.98px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );

  private readonly botonPedido = viewChild('botonPedido', { read: ElementRef<HTMLElement> });
  private readonly botonMenu = viewChild('botonMenu', { read: ElementRef<HTMLElement> });
  private cantidadPrevia = 0;

  constructor() {
    // Al sumar un plato, "Mi Pedido" hace zoom y un brillo lo cruza para avisar que se agregó
    effect(() => {
      const cantidad = this.cart.cantidad();
      if (cantidad > this.cantidadPrevia) this.avisarAgregado();
      this.cantidadPrevia = cantidad;
    });
  }

  private avisarAgregado() {
    const zoom = [{ transform: 'scale(1)' }, { transform: 'scale(1.14)', offset: 0.35 }, { transform: 'scale(1)' }];
    const opciones = { duration: 600, easing: 'ease-out' };
    const pedido = this.botonPedido()?.nativeElement;
    if (pedido) {
      pedido.animate(zoom, opciones);
      pedido.animate(
        [{ transform: 'translateX(-120%)' }, { transform: 'translateX(120%)' }],
        { duration: 700, easing: 'ease-in-out', pseudoElement: '::after' },
      );
    }
    this.botonMenu()?.nativeElement.animate(zoom, opciones); // en celular, el carrito vive en la hamburguesa
  }

  protected readonly enlaces = [
    { texto: 'Catálogo', fragmento: 'catalogo' },
    { texto: 'Categorías', fragmento: 'categorias' },
    { texto: 'Nosotros', fragmento: 'nosotros' },
    { texto: 'Ubicación', fragmento: 'footer-contacto' },
  ];
}
