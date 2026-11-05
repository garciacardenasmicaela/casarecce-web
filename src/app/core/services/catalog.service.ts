import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CATEGORIAS, STOCK_REPOSICION } from '../config/local.config';
import { PRODUCTOS_MOCK } from '../data/mock-data';
import { CategoriaFiltro, ImagenNueva, NuevoProducto, Producto } from '../models';
import { reducirImagen } from '../../shared/utils/imagen';
import { NotificationService } from './notification.service';
import { SupabaseService } from './supabase.service';

export const IMAGEN_PLATO_POR_DEFECTO =
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly supabase = inject(SupabaseService);
  private readonly notificar = inject(NotificationService);

  readonly categorias = CATEGORIAS;
  readonly productos = signal<Producto[]>(environment.modoDemo ? PRODUCTOS_MOCK : []);
  readonly cargando = signal(!environment.modoDemo);
  /** true si la primera carga falló (se muestra un botón para reintentar). */
  readonly error = signal(false);
  readonly categoriaActiva = signal<CategoriaFiltro>('all');

  readonly visibles = computed(() => {
    const cat = this.categoriaActiva();
    return cat === 'all' ? this.productos() : this.productos().filter(p => p.categoria === cat);
  });

  readonly tituloActual = computed(
    () => this.categorias.find(c => c.slug === this.categoriaActiva())?.titulo ?? 'Carta Completa',
  );

  constructor() {
    if (environment.modoDemo) return;
    void this.cargar();
    // El stock cambia durante el día: se refresca al volver a la pestaña y cada minuto mientras se mira la página
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void this.cargar(true);
    });
    setInterval(() => {
      if (document.visibilityState === 'visible') void this.cargar(true);
    }, 60_000);
  }

  /** `silencioso`: refresco en segundo plano (sin barra de carga ni avisos de error). */
  async cargar(silencioso = false) {
    if (!silencioso) this.cargando.set(true);
    const { data, error } = await this.supabase.client
      .from('productos')
      .select('id, categoria, nombre, descripcion, precio, porciones, imagen_url, stock')
      .order('created_at', { ascending: false })
      .order('nombre');
    this.cargando.set(false);

    if (error) {
      console.error('No se pudo cargar el catálogo', error);
      // Si ya había productos en pantalla, se dejan (un refresco fallido no debe borrar el catálogo)
      if (!silencioso && !this.productos().length) this.error.set(true);
      return;
    }
    this.error.set(false);
    const orden = (slug: string) => this.categorias.findIndex(c => c.slug === slug);
    const lista = (data ?? []).map(p => ({ ...p, precio: Number(p.precio) }) as Producto);
    this.productos.set(lista.sort((a, b) => orden(a.categoria) - orden(b.categoria)));
  }

  nombreCategoria(slug: string) {
    return this.categorias.find(c => c.slug === slug)?.nombre ?? '';
  }

  buscar(id: string) {
    return this.productos().find(p => p.id === id);
  }

  seleccionarCategoria(cat: CategoriaFiltro) {
    this.categoriaActiva.set(cat);
  }

  // ---- stock y precios (admin) ----
  /** Agotado ↔ repuesto con unidades de reposición. */
  alternarStock(id: string): Promise<boolean> {
    const p = this.buscar(id);
    return p ? this.guardar(id, { stock: p.stock > 0 ? 0 : STOCK_REPOSICION }) : Promise.resolve(false);
  }

  ajustarStock(id: string, delta: number): Promise<boolean> {
    const p = this.buscar(id);
    return p ? this.guardar(id, { stock: Math.min(99_999, Math.max(0, p.stock + delta)) }) : Promise.resolve(false);
  }

  fijarStock(id: string, unidades: number): Promise<boolean> {
    return this.guardar(id, { stock: Number.isFinite(unidades) ? Math.min(99_999, Math.max(0, Math.floor(unidades))) : 0 });
  }

  actualizarPrecio(id: string, precio: number): Promise<boolean> {
    return precio > 0 ? this.guardar(id, { precio }) : Promise.resolve(false);
  }

  async agregar(nuevo: NuevoProducto, imagen?: ImagenNueva): Promise<boolean> {
    let imagen_url = IMAGEN_PLATO_POR_DEFECTO;
    if (imagen?.archivo) {
      const subida = environment.modoDemo ? imagen.vistaPrevia : await this.subirImagen(imagen.archivo);
      if (!subida) {
        this.notificar.mostrar('No se pudo subir la imagen. Probá con otra o pegá un link.');
        return false;
      }
      imagen_url = subida;
    } else if (imagen?.url) {
      imagen_url = imagen.url;
    }

    const fila = { ...nuevo, imagen_url };
    let producto: Producto;
    if (environment.modoDemo) {
      producto = { ...fila, id: crypto.randomUUID() };
    } else {
      const { data, error } = await this.supabase.client.from('productos').insert(fila).select().single();
      if (error || !data) return this.fallo(error);
      producto = { ...data, precio: Number(data.precio) } as Producto;
    }
    this.productos.update(lista => [producto, ...lista]);
    return true;
  }

  private async subirImagen(original: File): Promise<string | null> {
    const archivo = await reducirImagen(original);
    const extension = archivo.name.split('.').pop()?.toLowerCase() || 'jpg';
    const ruta = `${crypto.randomUUID()}.${extension}`;
    const bucket = this.supabase.client.storage.from('productos');
    const { error } = await bucket.upload(ruta, archivo, { contentType: archivo.type });
    if (error) {
      console.error('No se pudo subir la imagen', error);
      return null;
    }
    return bucket.getPublicUrl(ruta).data.publicUrl;
  }

  private async guardar(id: string, cambios: Partial<Producto>): Promise<boolean> {
    if (!environment.modoDemo) {
      const { data, error } = await this.supabase.client.from('productos').update(cambios).eq('id', id).select('id');
      // Sin permisos (RLS) Supabase no da error: simplemente no actualiza ninguna fila
      if (error || !data?.length) return this.fallo(error);
    }
    this.productos.update(lista => lista.map(p => (p.id === id ? { ...p, ...cambios } : p)));
    return true;
  }

  private fallo(error: unknown): false {
    console.error(error);
    this.notificar.mostrar('No se pudo guardar. ¿Iniciaste sesión como administrador?');
    return false;
  }
}
