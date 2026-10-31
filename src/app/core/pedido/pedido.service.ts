import { Injectable, inject } from '@angular/core';
import { DatosPedido, ResumenPedido } from '../models';
import { DescuentoService } from '../descuento/descuento.service';
import { CartService } from '../services/cart.service';
import { CustomerService } from '../services/customer.service';
import { NotificationService } from '../services/notification.service';
import { PedidoMensajeBuilder } from './pedido-mensaje.builder';
import { WhatsAppService } from './whatsapp.service';

/**
 * Orquesta la confirmación del pedido:
 * resumen del carrito → mensaje → WhatsApp → registro del cliente → carrito vacío.
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly carrito = inject(CartService);
  private readonly clientes = inject(CustomerService);
  private readonly notificar = inject(NotificationService);
  private readonly descuentos = inject(DescuentoService);
  private readonly mensajes = inject(PedidoMensajeBuilder);
  private readonly whatsapp = inject(WhatsAppService);

  /** Devuelve true si el pedido se envió (y el carrito quedó vacío). El código de 10% OFF se canjea acá. */
  async confirmar(datos: DatosPedido): Promise<boolean> {
    if (this.carrito.vacio()) {
      this.notificar.mostrar('Agregá al menos un plato para enviar el pedido');
      return false;
    }

    // El código se marca como usado antes de enviar: si ya no sirve, se quita el descuento y se avisa
    if (!(await this.descuentos.canjear())) return false;

    const resumen = this.armarResumen();
    this.whatsapp.abrirChat(this.mensajes.construir(datos, resumen));

    this.clientes.registrar({ nombre: datos.nombre, whatsapp: datos.whatsapp, email: datos.email });
    this.carrito.vaciar();
    this.descuentos.quitar();
    this.notificar.mostrar(`Pedido #${resumen.numero} listo: confirmalo en WhatsApp para enviarlo`);
    return true;
  }

  private armarResumen(): ResumenPedido {
    return {
      numero: Date.now().toString(36).slice(-5).toUpperCase(),
      fecha: new Date(),
      items: this.carrito.items(),
      subtotal: this.carrito.subtotal(),
      descuento: this.carrito.descuento(),
      total: this.carrito.total(),
      descuentoAplicado: this.descuentos.activo(),
      codigoDescuento: this.descuentos.codigoAplicado(),
    };
  }
}
