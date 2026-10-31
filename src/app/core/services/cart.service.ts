import { Injectable, computed, inject, signal } from '@angular/core';
import { DESCUENTO_BIENVENIDA } from '../config/local.config';
import { ItemCarrito, LineaCarrito, Producto } from '../models';
import { CatalogService } from './catalog.service';
import { CustomerService } from './customer.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly catalogo = inject(CatalogService);
  private readonly clientes = inject(CustomerService);

  private readonly lineas = signal<LineaCarrito[]>([]);

  // Se derivan del catálogo para que un cambio de precio/stock se refleje en el pedido
  readonly items = computed<ItemCarrito[]>(() =>
    this.lineas().flatMap(l => {
      const producto = this.catalogo.buscar(l.productoId);
      return producto ? [{ producto, cantidad: l.cantidad }] : [];
    }),
  );
  readonly cantidad = computed(() => this.lineas().reduce((s, l) => s + l.cantidad, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.producto.precio * i.cantidad, 0));
  readonly descuento = computed(() =>
    this.clientes.descuentoActivo() ? Math.round(this.subtotal() * DESCUENTO_BIENVENIDA) : 0,
  );
  readonly total = computed(() => this.subtotal() - this.descuento());
  readonly vacio = computed(() => this.lineas().length === 0);

  agregar(producto: Producto) {
    if (!producto.disponible) return;
    this.lineas.update(ls =>
      ls.some(l => l.productoId === producto.id)
        ? ls.map(l => (l.productoId === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l))
        : [...ls, { productoId: producto.id, cantidad: 1 }],
    );
  }

  cambiarCantidad(productoId: string, delta: 1 | -1) {
    this.lineas.update(ls =>
      ls
        .map(l => (l.productoId === productoId ? { ...l, cantidad: l.cantidad + delta } : l))
        .filter(l => l.cantidad > 0),
    );
  }

  vaciar() {
    this.lineas.set([]);
  }
}
