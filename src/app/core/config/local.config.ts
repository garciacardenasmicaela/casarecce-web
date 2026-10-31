import { environment } from '../../../environments/environment';
import { Categoria, EstadoLocal, MetodoEntrega, MetodoPago } from '../models';

export const DESCUENTO_BIENVENIDA = 0.1;

export const LOCAL_INFO = {
  nombre: 'Casarecce',
  ciudad: 'San Miguel de Tucumán, Tucumán',
  mapsUrl: 'https://maps.google.com/?q=San+Miguel+de+Tucuman',
  horarioResumen: 'Mar a Sáb 9:00-14:30 | Dom 9:00-14:00 hs',
  horarios: [
    { dias: 'Martes a Sábados', horas: '9:00 a 14:30 hs' },
    { dias: 'Domingos', horas: '9:00 a 14:00 hs (Tomamos encargos anticipados)' },
  ],
  whatsappTexto: '+54 9 381 526-7382',
  whatsappUrl: `https://wa.me/${environment.whatsappLocal}`,
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
};

export const ESTADOS_LOCAL: { valor: EstadoLocal; etiqueta: string; emoji: string }[] = [
  { valor: 'abierto', etiqueta: 'Abierto • Tomando pedidos del día', emoji: '🟢' },
  { valor: 'encargos_fin_de_semana', etiqueta: 'Tomando encargos para el fin de semana', emoji: '🟡' },
  { valor: 'cerrado', etiqueta: 'Cerrado en este momento', emoji: '🔴' },
];

export const CATEGORIAS: Categoria[] = [
  { slug: 'all', nombre: 'Todo el Menú', titulo: 'Carta Completa', icono: 'restaurant' },
  { slug: 'pastas', nombre: 'Pastas Frescas', titulo: 'Pastas Frescas del Día', icono: 'ramen_dining' },
  { slug: 'freezados', nombre: 'Freezados & Listos', titulo: 'Freezados & Comidas Listas', icono: 'inventory_2' },
  { slug: 'dulces', nombre: 'Dulces & Tortas', titulo: 'Dulces & Tortas Artesanales', icono: 'cake' },
];

export const OPCIONES_CUANDO = [
  'Para hoy (en horario comercial)',
  'Encargo anticipado para el domingo al mediodía',
];

export const OPCIONES_ENTREGA: { valor: MetodoEntrega; etiqueta: string; detalle: string }[] = [
  { valor: 'retiro', etiqueta: 'Retiro por el local', detalle: 'Retiro por el local (San Miguel de Tucumán)' },
  { valor: 'uber_flash', etiqueta: 'Envío por Uber Flash / Cadetería externa', detalle: 'Envío por Uber Flash / Cadetería externa' },
];

export const OPCIONES_PAGO: { valor: MetodoPago; etiqueta: string; detalle: string }[] = [
  { valor: 'transferencia', etiqueta: 'Transferencia bancaria', detalle: 'Transferencia bancaria (solicito Alias/CBU)' },
  { valor: 'efectivo', etiqueta: 'Efectivo', detalle: 'Efectivo' },
];

export const AVISO_UBER_FLASH =
  'El envío corre por cuenta del cliente. Te avisamos por WhatsApp cuando el pedido esté empaquetado para que solicites el Uber Flash, o te ayudamos a pedirlo y le abonás al chofer al recibir.';
