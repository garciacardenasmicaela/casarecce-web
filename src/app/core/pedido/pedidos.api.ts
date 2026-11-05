import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DatosPedido, EstadoPedido, PedidoRegistrado, ResumenPedido } from '../models';
import { CustomerService } from '../services/customer.service';
import { SupabaseService } from '../services/supabase.service';

/**
 * Historial de pedidos. La web guarda cada pedido con la función SQL `registrar_pedido`
 * (que además completa la ficha del cliente); el admin los lee y cambia su estado.
 */
@Injectable({ providedIn: 'root' })
export class PedidosApi {
  private readonly supabase = inject(SupabaseService);
  private readonly clientes = inject(CustomerService);

  readonly pedidos = signal<PedidoRegistrado[]>([]);
  readonly cargando = signal(false);
  readonly error = signal(false);

  /** Guarda el pedido enviado. Nunca interrumpe al cliente: si falla, queda igual en su WhatsApp. */
  async registrar(datos: DatosPedido, resumen: ResumenPedido) {
    const cliente = { nombre: datos.nombre, whatsapp: datos.whatsapp, email: datos.email };
    const pedido: PedidoRegistrado = {
      numero: resumen.numero,
      nombre: datos.nombre,
      whatsapp: datos.whatsapp,
      email: datos.email || null,
      items: resumen.items.map(i => ({ nombre: i.producto.nombre, cantidad: i.cantidad, precio: i.producto.precio })),
      subtotal: resumen.subtotal,
      descuento: resumen.descuento,
      total: resumen.total,
      codigo_descuento: resumen.codigoDescuento,
      cuando: datos.cuando || null,
      entrega: datos.entrega,
      pago: datos.pago,
      notas: datos.notas || null,
      estado: 'nuevo',
      created_at: new Date().toISOString(),
    };

    if (environment.modoDemo) {
      this.clientes.registrar(cliente);
      this.pedidos.update(lista => [pedido, ...lista]);
      return;
    }
    this.clientes.datosActuales.set(cliente);
    try {
      const { data, error } = await this.supabase.client.rpc('registrar_pedido', { p: pedido });
      if (error) throw error;
      if (data?.ok) return;
      console.warn('Pedido no guardado en el historial', data);
    } catch (e) {
      // Función todavía no creada (migración 0007 pendiente) o sin red: al menos queda la ficha del cliente
      console.error('No se pudo guardar el pedido', e);
      this.clientes.registrar(cliente);
    }
  }

  // ---------- admin ----------
  async cargar() {
    if (environment.modoDemo) return;
    this.cargando.set(true);
    this.error.set(false);
    const { data, error } = await this.supabase.client
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);
    this.cargando.set(false);
    if (error) {
      console.error(error);
      this.error.set(true);
      return;
    }
    this.pedidos.set((data ?? []) as PedidoRegistrado[]);
  }

  async cambiarEstado(pedido: PedidoRegistrado, estado: EstadoPedido): Promise<boolean> {
    if (!environment.modoDemo) {
      const { error } = await this.supabase.client.from('pedidos').update({ estado }).eq('id', pedido.id!);
      if (error) {
        console.error(error);
        return false;
      }
    }
    this.pedidos.update(lista => lista.map(p => (p === pedido ? { ...p, estado } : p)));
    return true;
  }
}
