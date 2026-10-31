import { Injectable } from '@angular/core';
import { OPCIONES_ENTREGA, OPCIONES_PAGO } from '../config/local.config';
import { DatosPedido, ResumenPedido } from '../models';
import { PrecioPipe } from '../../shared/pipes/precio.pipe';

const SEPARADOR = '━━━━━━━━━━━━━━━━━━';

/**
 * Arma el texto del pedido que le llega al local por WhatsApp.
 * Es una función pura de (datos del cliente + resumen): no toca el carrito ni el DOM.
 * Usa el formato de WhatsApp: *negrita* y _cursiva_.
 */
@Injectable({ providedIn: 'root' })
export class PedidoMensajeBuilder {
  private readonly precio = new PrecioPipe();

  construir(datos: DatosPedido, resumen: ResumenPedido): string {
    return [
      this.encabezado(resumen),
      SEPARADOR,
      this.cliente(datos),
      '',
      this.detalle(resumen),
      SEPARADOR,
      this.totales(resumen),
      SEPARADOR,
      this.entregaYPago(datos, resumen),
      ...this.notas(datos),
      SEPARADOR,
      '_Pedido generado desde la web de Casarecce_ 🍝',
    ].join('\n');
  }

  private encabezado(r: ResumenPedido) {
    const fecha = r.fecha.toLocaleString('es-AR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    return `🍝 *NUEVO PEDIDO · CASARECCE*\n🧾 Pedido *#${r.numero}*\n🕒 ${fecha}`;
  }

  private cliente(d: DatosPedido) {
    return [
      '👤 *Cliente*',
      d.nombre,
      `📞 WhatsApp: ${d.whatsapp}`,
      `✉️ Email: ${d.email || 'No especificado'}`,
    ].join('\n');
  }

  private detalle(r: ResumenPedido) {
    const lineas = r.items.map(
      ({ producto, cantidad }) =>
        `• ${cantidad} × ${producto.nombre} — ${this.precio.transform(producto.precio * cantidad)}\n   _${producto.porciones}_`,
    );
    return ['🛒 *Detalle del pedido*', ...lineas].join('\n');
  }

  private totales(r: ResumenPedido) {
    const lineas = [`Subtotal: ${this.precio.transform(r.subtotal)}`];
    if (r.descuentoAplicado) lineas.push(`🏷️ Descuento 10% bienvenida: -${this.precio.transform(r.descuento)}`);
    lineas.push(`💰 *TOTAL: ${this.precio.transform(r.total)}*`);
    return lineas.join('\n');
  }

  private entregaYPago(d: DatosPedido, r: ResumenPedido) {
    const entrega = OPCIONES_ENTREGA.find(o => o.valor === d.entrega)!;
    const pago = OPCIONES_PAGO.find(o => o.valor === d.pago)!;

    const lineas = [`📅 Para cuándo: ${d.cuando}`, `📍 Entrega: ${entrega.detalle}`];
    if (d.entrega === 'uber_flash') lineas.push(`   _El envío corre por cuenta del cliente._`);

    lineas.push(`💳 Pago: ${pago.detalle}`);
    if (d.pago === 'efectivo' && d.efectivoCon) lineas.push(`   Abona con: ${d.efectivoCon}`);
    if (d.pago === 'transferencia') lineas.push(`   _Por favor, pasame el Alias/CBU para transferir ${this.precio.transform(r.total)}._`);
    return lineas.join('\n');
  }

  private notas(d: DatosPedido) {
    return d.notas ? ['', `📝 *Aclaraciones:* ${d.notas}`] : [];
  }
}

