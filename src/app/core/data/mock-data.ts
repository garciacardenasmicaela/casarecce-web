import { Cliente, Producto } from '../models';

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=800`;

export const PRODUCTOS_MOCK: Producto[] = [
  { id: '1', categoria: 'pastas', nombre: 'Sorrentinos de Ternera Braseada y Albahaca', porciones: 'Caja x 12 u. • Rinde 2 platos abundantes', descripcion: 'Masa fresca al huevo con relleno generoso de ternera braseada a fuego lento, muzzarella y hojas de albahaca fresca.', precio: 9200, imagen_url: U('photo-1621996346565-e3d5d6281297'), stock: 14 },
  { id: '2', categoria: 'pastas', nombre: 'Ravioles de Espinaca, Ricota y Nuez', porciones: 'Plancha x 24 u. • Rinde 2 porciones', descripcion: 'Clásica receta italiana con ricota artesanal cremosa, espinaca fresca seleccionada, parmesano y nueces tostadas.', precio: 8400, imagen_url: U('photo-1551183053-bf91a1d81141'), stock: 10 },
  { id: '3', categoria: 'pastas', nombre: 'Tagliatelle al Huevo de Campo', porciones: 'Paquete 500 g • Rinde 3 a 4 porciones', descripcion: 'Fideos cintas cortados a cuchillo elaborados únicamente con sémola de trigo candeal y huevos frescos de granja.', precio: 6800, imagen_url: U('photo-1563379091339-03b21ab4a4f8'), stock: 18 },
  { id: '4', categoria: 'freezados', nombre: 'Salsa Pomodoro Casera de la Nonna', porciones: 'Pote 450 cc • Rinde 2 a 3 platos', descripcion: 'Tomates perita seleccionados cocinados lentamente con oliva extra virgen, ajo confitado y albahaca fresca.', precio: 4200, imagen_url: U('photo-1572441713132-c542fc4fe282'), stock: 15 },
  { id: '5', categoria: 'freezados', nombre: 'Tarta Casera de Jamón Natural y Queso', porciones: 'Tarta entera • Rinde 4 porciones', descripcion: 'Masa quebrada casera lista para calentar en horno, rellena de jamón cocido natural, muzzarella y toque de crema.', precio: 10500, imagen_url: U('photo-1608897013039-887f21d8c804'), stock: 4 },
  { id: '6', categoria: 'freezados', nombre: 'Lasagna Bolognesa Lista para Hornear', porciones: 'Bandeja 1 kg • Rinde 3 platos abundantes', descripcion: 'Capas de masa fina al huevo, ragú de ternera, jamón, bechamel suave y gratinado de queso reggianito.', precio: 13800, imagen_url: U('photo-1574894709920-11b28e7367e3'), stock: 0 },
  { id: '7', categoria: 'dulces', nombre: 'Tarta Tradicional Italiana de Ricota', porciones: 'Tarta entera • Rinde 8 porciones', descripcion: 'Masa frola suave perfumada con ralladura de limón y relleno cremoso de ricota entera espolvoreada con azúcar impalpable.', precio: 12500, imagen_url: U('photo-1533134242443-d4fd215305ad'), stock: 6 },
  { id: '8', categoria: 'dulces', nombre: 'Torta Marquise con Dulce de Leche y Frutos Rojos', porciones: 'Torta entera • Rinde 8 a 10 porciones', descripcion: 'Base húmeda de chocolate intenso con capa generosa de dulce de leche repostero, crema chantilly y frutos rojos.', precio: 16900, imagen_url: U('photo-1578985545062-69928b1d9587'), stock: 3 },
];

export const CLIENTES_MOCK: Cliente[] = [
  { nombre: 'Mariana Gómez', whatsapp: '3815412098', email: 'mariana.gomez@gmail.com' },
  { nombre: 'Lucas Pereyra', whatsapp: '3816098231', email: 'lucaspereyra.tuc@gmail.com' },
  { nombre: 'Valentina Rossi', whatsapp: '3814887102', email: 'valen.rossi@hotmail.com' },
];
