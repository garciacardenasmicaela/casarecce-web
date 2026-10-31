import { Injectable, computed, inject, signal } from '@angular/core';
import { DESCUENTO_BIENVENIDA } from '../config/local.config';
import { ItemCarrito, LineaCarrito, Producto } from '../models';
import { CatalogService } from './catalog.service';
import { CustomerService } from './customer.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly catalogo = inject(CatalogService);
  private readonly clientes = inject(CustomerService);
  private readonly notificar = inject(NotificationService);

  private readonly lineas = signal<LineaCarrito[]>([]);

  // Se derivan del catálogo: si cambia el precio o baja el stock, el pedido se ajusta solo
  readonly items = computed<ItemCarrito[]>(() =>
    this.lineas().flatMap(l => {
      const producto = this.catalogo.buscar(l.productoId);
      const cantidad = producto ? Math.min(l.cantidad, producto.stock) : 0;
      return producto && cantidad > 0 ? [{ producto, cantidad }] : [];
    }),
  );
  readonly cantidad = computed(() => this.items().reduce((s, i) => s + i.cantidad, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.producto.precio * i.cantidad, 0));
  readonly descuento = computed(() =>
    this.clientes.descuentoActivo() ? Math.round(this.subtotal() * DESCUENTO_BIENVENIDA) : 0,
  );
  readonly total = computed(() => this.subtotal() - this.descuento());
  readonly vacio = computed(() => this.items().length === 0);

  /** Devuelve true si se agregó una unidad. */
  agregar(producto: Producto): boolean {
    if (producto.stock <= 0) return false;
    const actual = this.cantidadDe(producto.id);
    if (actual >= producto.stock) {
      this.notificar.mostrar(`Solo quedan ${producto.stock} u. disponibles de este plato`);
      return false;
    }
    this.fijar(producto.id, actual + 1);
    return true;
  }

  cambiarCantidad(productoId: string, delta: 1 | -1) {
    const producto = this.catalogo.buscar(productoId);
    if (!producto) return;
    const actual = this.cantidadDe(productoId);
    if (delta > 0 && actual >= producto.stock) {
      this.notificar.mostrar(`Máximo disponible hoy: ${producto.stock} unidades`);
      return;
    }
    this.fijar(productoId, actual + delta);
  }

  vaciar() {
    this.lineas.set([]);
  }

  private cantidadDe(productoId: string) {
    return this.items().find(i => i.producto.id === productoId)?.cantidad ?? 0;
  }

  private fijar(productoId: string, cantidad: number) {
    this.lineas.update(ls => {
      const resto = ls.filter(l => l.productoId !== productoId);
      return cantidad > 0 ? [...resto, { productoId, cantidad }] : resto;
    });
  }
}
