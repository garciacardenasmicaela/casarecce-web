import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Único punto que sabe cómo abrir un chat de WhatsApp con el local. */
@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private readonly numeroLocal = environment.whatsappLocal;

  enlace(mensaje: string): string {
    return `https://wa.me/${this.numeroLocal}?text=${encodeURIComponent(mensaje)}`;
  }

  /** Enlace para escribirle a un cliente (Argentina: agrega 549 si falta el código de país). */
  enlaceACliente(telefono: string, mensaje: string): string {
    let n = telefono.replace(/\D/g, '').replace(/^0+/, '');
    if (!n.startsWith('54')) n = '549' + n;
    return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`;
  }

  /** Abre el chat con el mensaje listo para enviar. Devuelve false si el navegador lo bloqueó. */
  abrirChat(mensaje: string): boolean {
    // Sin 'noopener' en las features: con él window.open devuelve siempre null y no se puede saber si se abrió
    const ventana = window.open(this.enlace(mensaje), '_blank');
    if (ventana) {
      ventana.opener = null;
      return true;
    }
    // Popup bloqueado (común en celulares): se navega en la misma pestaña
    window.location.href = this.enlace(mensaje);
    return true;
  }
}
