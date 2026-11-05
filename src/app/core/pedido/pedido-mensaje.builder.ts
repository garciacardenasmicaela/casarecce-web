import { Injectable } from '@angular/core';
import { OPCIONES_ENTREGA, OPCIONES_PAGO } from '../config/local.config';
import { DatosPedido, ResumenPedido } from '../models';
import { formatearCodigo } from '../descuento/codigo.utils';
import { PrecioPipe } from '../../shared/pipes/precio.pipe';

const SEPARADOR = '━━━━━━━━━━━━━━━━━━━━';

/**
 * Arma el texto del pedido que le llega al local por WhatsApp.
 * Es una función pura de (datos del cliente + resumen): no toca el carrito ni el DOM.
 * Una sección por bloque, separadas por una línea, sin íconos. Usa el formato de WhatsApp: *negrita* y _cursiva_.
 */
@Injectable({ providedIn: 'root' })
export class PedidoMensajeBuilder {
  private readonly precio = new PrecioPipe();

  construir(datos: DatosPedido, resumen: ResumenPedido): string {
    const secciones = [
      this.encabezado(resumen),
      this.cliente(datos),
      this.pedido(resumen),
      this.total(resumen),
      this.entrega(datos, resumen),
      this.pago(datos, resumen),
      ...this.aclaraciones(datos),
    ];
    return secciones.join(`\n${SEPARADOR}\n`);
  }

  private encabezado(r: ResumenPedido) {
    const f = r.fecha;
    const dia = f.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = f.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
    return [`*NUEVO PEDIDO · CASARECCE*`, `Pedido N° *${r.numero}*`, `${diaCapitalizado} · ${hora} hs`].join('\n');
  }

  private cliente(d: DatosPedido) {
    return [
      '*CLIENTE*',
      `Nombre: ${d.nombre}`,
      `WhatsApp: ${d.whatsapp}`,
      `Email: ${d.email || 'No especificado'}`,
    ].join('\n');
  }

  private pedido(r: ResumenPedido) {
    const items = r.items.map(({ producto, cantidad }) =>
      [
        `*${cantidad} x ${producto.nombre}*`,
        `${producto.porciones}`,
        `${this.precio.transform(producto.precio)} c/u  →  ${this.precio.transform(producto.precio * cantidad)}`,
      ].join('\n'),
    );
    return ['*PEDIDO*', items.join('\n\n')].join('\n');
  }

  private total(r: ResumenPedido) {
    const lineas = ['*TOTAL*', `Subtotal: ${this.precio.transform(r.subtotal)}`];
    if (r.descuentoAplicado) {
      const codigo = r.codigoDescuento ? ` (código ${formatearCodigo(r.codigoDescuento)})` : '';
      lineas.push(`Descuento 10% primera compra${codigo}: -${this.precio.transform(r.descuento)}`);
    }
    lineas.push('', `*TOTAL A PAGAR: ${this.precio.transform(r.total)}*`);
    return lineas.join('\n');
  }

  private entrega(d: DatosPedido, r: ResumenPedido) {
    const entrega = OPCIONES_ENTREGA.find(o => o.valor === d.entrega)!;
    const lineas = ['*ENTREGA*', `Para cuándo: ${d.cuando}`, `Forma de entrega: *${entrega.detalle}*`];
    if (d.entrega === 'uber_flash') lineas.push('_El envío corre por cuenta del cliente._');
    if (r.localCerrado) lineas.push('_Pedido enviado con el local cerrado: queda como encargo._');
    return lineas.join('\n');
  }

  private pago(d: DatosPedido, r: ResumenPedido) {
    const pago = OPCIONES_PAGO.find(o => o.valor === d.pago)!;
    const lineas = ['*PAGO*', `Forma de pago: *${pago.detalle}*`];
    if (d.pago === 'efectivo' && d.efectivoCon) lineas.push(`Abona con: ${d.efectivoCon}`);
    if (d.pago === 'transferencia') lineas.push(`_Pasar Alias/CBU para transferir ${this.precio.transform(r.total)}._`);
    return lineas.join('\n');
  }

  private aclaraciones(d: DatosPedido) {
    return d.notas ? [['*ACLARACIONES*', d.notas].join('\n')] : [];
  }
}
