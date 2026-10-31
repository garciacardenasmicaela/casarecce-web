import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CATEGORIAS } from '../config/local.config';
import { PRODUCTOS_MOCK } from '../data/mock-data';
import { CategoriaFiltro, NuevoProducto, Producto } from '../models';
import { NotificationService } from './notification.service';
import { SupabaseService } from './supabase.service';

const IMAGEN_POR_DEFECTO =
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly supabase = inject(SupabaseService);
  private readonly notificar = inject(NotificationService);

  readonly categorias = CATEGORIAS;
  readonly productos = signal<Producto[]>(environment.modoDemo ? PRODUCTOS_MOCK : []);
  readonly cargando = signal(!environment.modoDemo);
  readonly categoriaActiva = signal<CategoriaFiltro>('all');

  readonly visibles = computed(() => {
    const cat = this.categoriaActiva();
    return cat === 'all' ? this.productos() : this.productos().filter(p => p.categoria === cat);
  });

  readonly tituloActual = computed(
    () => this.categorias.find(c => c.slug === this.categoriaActiva())?.titulo ?? 'Carta Completa',
  );

  constructor() {
    if (!environment.modoDemo) void this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    const { data, error } = await this.supabase.client
      .from('productos')
      .select('id, categoria, nombre, descripcion, precio, porciones, imagen_url, disponible')
      .order('created_at', { ascending: false })
      .order('nombre');
    this.cargando.set(false);

    if (error) {
      console.error('No se pudo cargar el catálogo', error);
      this.notificar.mostrar('No se pudo cargar el catálogo. Probá recargar la página.');
      return;
    }
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

  async alternarStock(id: string): Promise<boolean> {
    const p = this.buscar(id);
    return p ? this.guardar(id, { disponible: !p.disponible }) : false;
  }

  async actualizarPrecio(id: string, precio: number): Promise<boolean> {
    return precio > 0 ? this.guardar(id, { precio }) : false;
  }

  async agregar(nuevo: NuevoProducto): Promise<boolean> {
    const fila = { ...nuevo, imagen_url: IMAGEN_POR_DEFECTO, disponible: true };
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
