import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DESCUENTO_BIENVENIDA } from '../config/local.config';
import { ItemCarrito, LineaCarrito, Producto } from '../models';
import { CatalogService } from './catalog.service';
import { DescuentoService } from '../descuento/descuento.service';
import { NotificationService } from './notification.service';

const CLAVE = 'casarecce.carrito';
const VIGENCIA_MS = 24 * 60 * 60 * 1000; // el carrito guardado dura un día (después los precios pueden haber cambiado)

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly catalogo = inject(CatalogService);
  private readonly descuentos = inject(DescuentoService);
  private readonly notificar = inject(NotificationService);

  private readonly lineas = signal<LineaCarrito[]>(this.leerGuardado());

  constructor() {
    // Cada cambio se guarda en el celular del cliente: si recarga o vuelve de WhatsApp, no pierde el pedido
    effect(() => this.guardar(this.lineas()));
  }

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
    this.descuentos.activo() ? Math.round(this.subtotal() * DESCUENTO_BIENVENIDA) : 0,
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

  private leerGuardado(): LineaCarrito[] {
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (!crudo) return [];
      const { guardado, lineas } = JSON.parse(crudo) as { guardado: number; lineas: LineaCarrito[] };
      if (Date.now() - guardado > VIGENCIA_MS || !Array.isArray(lineas)) return [];
      return lineas.filter(l => typeof l.productoId === 'string' && Number.isInteger(l.cantidad) && l.cantidad > 0);
    } catch {
      return []; // sin almacenamiento (modo privado) o dato corrupto: se empieza vacío
    }
  }

  private guardar(lineas: LineaCarrito[]) {
    try {
      if (lineas.length) localStorage.setItem(CLAVE, JSON.stringify({ guardado: Date.now(), lineas }));
      else localStorage.removeItem(CLAVE);
    } catch {
      /* sin almacenamiento: el carrito sigue funcionando en memoria */
    }
  }

  private cantidadDe(productoId: string) {
    return this.items().find(i => i.producto.id === productoId)?.cantidad ?? 0;
  }

  private fijar(productoId: string, cantidad: number) {
    this.lineas.update(ls => {
      if (cantidad <= 0) return ls.filter(l => l.productoId !== productoId);
      return ls.some(l => l.productoId === productoId)
        ? ls.map(l => (l.productoId === productoId ? { ...l, cantidad } : l)) // conserva el orden
        : [...ls, { productoId, cantidad }];
    });
  }
}
