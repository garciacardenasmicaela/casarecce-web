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
  stock: number; // unidades disponibles hoy (0 = agotado)
}

export type NuevoProducto = Omit<Producto, 'id' | 'imagen_url'>;

/** Imagen elegida en el admin: archivo subido o link, con vista previa. */
export interface ImagenNueva {
  archivo: File | null;
  url: string;
  vistaPrevia: string;
}

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

/** Foto fija del pedido al momento de confirmarlo (lo que se envía por WhatsApp). */
export interface ResumenPedido {
  numero: string;
  fecha: Date;
  items: ItemCarrito[];
  subtotal: number;
  descuento: number;
  total: number;
  descuentoAplicado: boolean;
}
