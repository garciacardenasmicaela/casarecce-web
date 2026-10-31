import { Injectable, computed, inject, signal } from '@angular/core';
import { DatosCliente, ResultadoSolicitud } from '../models';
import { NotificationService } from '../services/notification.service';
import { CodigosApi } from './codigos.api';
import { normalizarCodigo } from './codigo.utils';

/** Estado del beneficio 10% OFF en la sesión: qué código se aplicó al pedido. */
@Injectable({ providedIn: 'root' })
export class DescuentoService {
  private readonly api = inject(CodigosApi);
  private readonly notificar = inject(NotificationService);

  /** Código validado y aplicado al pedido actual (sin guion). */
  readonly codigoAplicado = signal<string | null>(null);
  readonly activo = computed(() => this.codigoAplicado() !== null);

  solicitar(datos: DatosCliente): Promise<ResultadoSolicitud> {
    return this.api.solicitar(datos);
  }

  /** Valida el código y, si sirve, deja el 10% aplicado en el pedido. */
  async aplicar(texto: string): Promise<{ ok: boolean; mensaje: string }> {
    const codigo = normalizarCodigo(texto);
    if (codigo.length !== 8) return { ok: false, mensaje: 'El código tiene 8 caracteres (ej: ABCD-EFGH)' };

    const r = await this.api.validar(codigo);
    if (r.valido) {
      this.codigoAplicado.set(codigo);
      return { ok: true, mensaje: '¡10% OFF aplicado a tu pedido!' };
    }
    const motivos = {
      inexistente: 'Ese código no existe. Revisá que esté bien escrito.',
      usado: 'Ese código ya fue utilizado.',
      vencido: 'Ese código venció (duran 7 días).',
      error: 'No pudimos validar el código. Probá de nuevo en un momento.',
    };
    return { ok: false, mensaje: motivos[r.motivo ?? 'error'] };
  }

  /** Se llama al confirmar el pedido: marca el código como usado. false = ya no es válido. */
  async canjear(): Promise<boolean> {
    const codigo = this.codigoAplicado();
    if (!codigo) return true;
    const ok = await this.api.canjear(codigo);
    if (!ok) {
      this.codigoAplicado.set(null);
      this.notificar.mostrar('Tu código ya no es válido, se quitó el descuento del pedido.');
    }
    return ok;
  }

  quitar() {
    this.codigoAplicado.set(null);
  }
}
