import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Cliente } from '../models';
import { CustomerService } from '../services/customer.service';
import { SupabaseService } from '../services/supabase.service';
import { formatearCodigo, normalizarCodigo } from './codigo.utils';

/** "2026-11-10T..." -> "10 de noviembre" */
const fechaLarga = (iso: string) => {
  const f = new Date(iso);
  return `${f.getDate()} de ${f.toLocaleDateString('es-AR', { month: 'long' })}`;
};

/** Herramientas del panel admin: buscar un código, marcarlo como usado y armar el aviso por WhatsApp. */
@Injectable({ providedIn: 'root' })
export class CodigosAdminService {
  private readonly clientes = inject(CustomerService);
  private readonly supabase = inject(SupabaseService);

  /** Busca al dueño de un código (admin: la base permite leer todos). */
  async buscar(texto: string): Promise<Cliente | null> {
    const codigo = normalizarCodigo(texto);
    if (!codigo) return null;
    await this.clientes.cargar();
    return this.clientes.clientes().find(c => c.codigo?.codigo === codigo) ?? null;
  }

  /** Marca el código como usado (por ejemplo si el cliente lo usó en el local). */
  async marcarUsado(cliente: Cliente): Promise<boolean> {
    const codigo = cliente.codigo;
    if (!codigo || codigo.usado_at) return false;
    const ahora = new Date().toISOString();

    if (!environment.modoDemo) {
      const { data, error } = await this.supabase.client
        .from('codigos_descuento')
        .update({ usado_at: ahora })
        .eq('codigo', codigo.codigo)
        .is('usado_at', null)
        .select('codigo');
      if (error || !data?.length) return false;
      // Igual que al canjear desde la web: queda registrado en la ficha del cliente
      if (cliente.id) await this.supabase.client.from('clientes').update({ descuento_usado: true }).eq('id', cliente.id);
    }
    this.clientes.clientes.update(lista =>
      lista.map(c => (c.codigo?.codigo === codigo.codigo ? { ...c, codigo: { ...codigo, usado_at: ahora } } : c)),
    );
    return true;
  }

  /** Enlace "mailto:" con el código listo para enviar (texto plano, sin formato de WhatsApp). */
  enlaceEmail(cliente: Cliente): string {
    const c = cliente.codigo!;
    const vence = fechaLarga(c.expira_at);
    const cuerpo =
      `Hola ${cliente.nombre || ''}!\n\nTu código de 10% OFF en tu primera compra en Casarecce es:\n\n${formatearCodigo(c.codigo)}\n\n` +
      `Es de un solo uso y vence el ${vence}. Ingresalo en la web desde "10% OFF 1ª Compra" > "Ya tengo mi código".\n\nCasarecce`;
    return `mailto:${encodeURIComponent(cliente.email)}?subject=${encodeURIComponent('Tu código de 10% OFF - Casarecce')}&body=${encodeURIComponent(cuerpo)}`;
  }

  mensajeParaCliente(cliente: Cliente): string {
    const c = cliente.codigo!;
    const vence = fechaLarga(c.expira_at);
    return (
      `¡Hola ${cliente.nombre || ''}! Tu código de *10% OFF* en tu primera compra en Casarecce es:\n\n` +
      `*${formatearCodigo(c.codigo)}*\n\n` +
      `Es de un solo uso y vence el ${vence}. Ingresalo en la web desde "10% OFF 1ª Compra" → "Ya tengo mi código".`
    );
  }
}
