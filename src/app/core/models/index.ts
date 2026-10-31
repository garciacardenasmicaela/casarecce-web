export type EstadoLocal = 'abierto' | 'encargos_fin_de_semana' | 'cerrado';
export type CategoriaSlug = 'pastas' | 'freezados' | 'dulces';
export type CategoriaFiltro = CategoriaSlug | 'all';

export interface Categoria {
  slug: CategoriaFiltro;
  nombre: string;
  titulo: string; // encabezado de la sección de catálogo
  icono: string;  // nombre de Material Icon
}

export interface Producto {
  id: string;
  categoria: CategoriaSlug;
  nombre: string;
  descripcion: string;
  precio: number;
  porciones: string; // ej: "Caja x 12 u. • Rinde 2 platos abundantes"
  imagen_url: string | null;
  disponible: boolean;
}

export type NuevoProducto = Omit<Producto, 'id' | 'imagen_url' | 'disponible'>;

export interface DatosCliente {
  nombre: string;
  whatsapp: string;
  email: string;
}

export interface Cliente extends DatosCliente {
  id?: string;
  created_at?: string;
}

export interface LineaCarrito {
  productoId: string;
  cantidad: number;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export type MetodoEntrega = 'retiro' | 'uber_flash';
export type MetodoPago = 'transferencia' | 'efectivo';

export interface DatosPedido extends DatosCliente {
  cuando: string;
  entrega: MetodoEntrega;
  pago: MetodoPago;
  efectivoCon: string;
  notas: string;
}

export interface Novedad {
  id?: string;
  titulo: string;
  mensaje: string;
  enviada_at?: string | null;
}
