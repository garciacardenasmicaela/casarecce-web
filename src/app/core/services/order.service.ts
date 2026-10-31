import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OPCIONES_ENTREGA, OPCIONES_PAGO } from '../config/local.config';
import { DatosPedido } from '../models';
import { CartService } from './cart.service';
import { CustomerService } from './customer.service';
import { PrecioPipe } from '../../shared/pipes/precio.pipe';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly carrito = inject(CartService);
  private readonly clientes = inject(CustomerService);
  private readonly precio = new PrecioPipe();

  /** Arma el mensaje con el formato de la propuesta integral. */
  construirMensaje(d: DatosPedido): string {
    const entrega = OPCIONES_ENTREGA.find(o => o.valor === d.entrega)!.detalle;
    const pago = OPCIONES_PAGO.find(o => o.valor === d.pago)!.detalle;
    const conCuanto = d.pago === 'efectivo' && d.efectivoCon ? ` (Abona con ${d.efectivoCon})` : '';

    const lineas = [
      '🍝 NUEVO PEDIDO - CASARECCE',
      '━━━━━━━━━━━━━━━━━━',
      `👤 Cliente: ${d.nombre}`,
      `📞 Teléfono: ${d.whatsapp}`,
      `✉️ Email: ${d.email || 'No especificado'}`,
      `📅 Fecha/Hora: ${d.cuando}`,
      '',
      '🛒 Detalle del pedido:',
      ...this.carrito.items().map(i => `• ${i.cantidad}x ${i.producto.nombre} (${i.producto.porciones})`),
      '',
      `🏷️ Descuento 10% bienvenida: ${this.clientes.descuentoActivo() ? 'Aplicado' : 'No aplica'}`,
      `💰 Total aproximado: ${this.precio.transform(this.carrito.total())}`,
      `📍 Entrega: ${entrega}`,
      `💳 Pago: ${pago}${conCuanto}`,
    ];
    if (d.notas) lineas.push(`📝 Nota: ${d.notas}`);
    return lineas.join('\n');
  }

  enviarPorWhatsApp(datos: DatosPedido) {
    this.clientes.registrar({ nombre: datos.nombre, whatsapp: datos.whatsapp, email: datos.email });
    const url = `https://wa.me/${environment.whatsappLocal}?text=${encodeURIComponent(this.construirMensaje(datos))}`;
    window.open(url, '_blank', 'noopener');
  }
}
