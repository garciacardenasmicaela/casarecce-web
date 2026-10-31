import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CLIENTES_MOCK } from '../data/mock-data';
import { Cliente, DatosCliente } from '../models';
import { NotificationService } from './notification.service';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly notificar = inject(NotificationService);
  private readonly supabase = inject(SupabaseService);

  readonly clientes = signal<Cliente[]>(environment.modoDemo ? CLIENTES_MOCK : []);
  readonly descuentoActivo = signal(false);
  /** Últimos datos ingresados: sirven para precargar el pedido. */
  readonly datosActuales = signal<DatosCliente | null>(null);

  constructor() {
    if (environment.modoDemo) return;
    // Al volver del ingreso con Google/Facebook/Apple, se precargan nombre y email
    this.supabase.client.auth.onAuthStateChange((_evento, sesion) => {
      const usuario = sesion?.user;
      if (!usuario || usuario.app_metadata?.['provider'] === 'email') return;
      const meta = usuario.user_metadata ?? {};
      this.datosActuales.update(previo => ({
        nombre: meta['full_name'] ?? meta['name'] ?? previo?.nombre ?? '',
        whatsapp: previo?.whatsapp ?? '',
        email: usuario.email ?? previo?.email ?? '',
      }));
    });
  }

  /** Libreta de clientes (solo el admin puede leerla). */
  async cargar() {
    if (environment.modoDemo) return;
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('id, nombre, whatsapp, email, created_at')
      .order('created_at', { ascending: false });
    if (error) return console.error(error);
    this.clientes.set((data ?? []).map(c => ({ ...c, whatsapp: c.whatsapp ?? '', email: c.email ?? '' })));
  }

  activarDescuento(datos: DatosCliente) {
    this.registrar(datos);
    this.descuentoActivo.set(true);
  }

  registrar(datos: DatosCliente) {
    this.datosActuales.set(datos);
    if (environment.modoDemo) {
      if (!this.clientes().some(c => c.whatsapp === datos.whatsapp)) {
        this.clientes.update(lista => [datos, ...lista]);
      }
      return;
    }
    void this.guardarEnBase(datos.nombre, datos.whatsapp, datos.email);
  }

  suscribirEmail(email: string) {
    if (environment.modoDemo) {
      this.clientes.update(lista => [{ nombre: 'Suscriptor Web', whatsapp: '-', email }, ...lista]);
      return;
    }
    void this.guardarEnBase('Suscriptor Web', '', email);
  }

  async iniciarSesionSocial(proveedor: 'google' | 'facebook' | 'apple') {
    if (environment.modoDemo) {
      this.notificar.mostrar('Ingreso con redes disponible al conectar Supabase (modo demo)');
      return;
    }
    const { error } = await this.supabase.signInWithProvider(proveedor);
    if (error) this.notificar.mostrar('Ese método de ingreso todavía no está habilitado.');
  }

  private async guardarEnBase(nombre: string, whatsapp: string, email: string) {
    const { error } = await this.supabase.client
      .from('clientes')
      .insert({ nombre, whatsapp: whatsapp || null, email: email || null });
    // 23505 = ya estaba en la libreta (mismo WhatsApp o email): está bien
    if (error && error.code !== '23505') console.error('No se pudo registrar al cliente', error);
  }
}
