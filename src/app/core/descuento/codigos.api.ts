import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DatosCliente, ResultadoSolicitud, ResultadoValidacion } from '../models';
import { CustomerService } from '../services/customer.service';
import { SupabaseService } from '../services/supabase.service';
import { DIAS_VIGENCIA, estadoDeCodigo, generarCodigoDemo, normalizarCodigo } from './codigo.utils';

/**
 * Operaciones del cliente sobre su código. En producción llama a las funciones SQL
 * (solicitar_codigo, validar_codigo, canjear_codigo); en modo demo simula lo mismo en memoria.
 */
@Injectable({ providedIn: 'root' })
export class CodigosApi {
  private readonly supabase = inject(SupabaseService);
  private readonly clientes = inject(CustomerService);

  async solicitar(datos: DatosCliente): Promise<ResultadoSolicitud> {
    if (environment.modoDemo) return this.solicitarDemo(datos);
    const { data, error } = await this.supabase.client.rpc('solicitar_codigo', {
      p_nombre: datos.nombre, p_whatsapp: datos.whatsapp, p_email: datos.email,
    });
    if (error) { console.error(error); return 'error'; }
    return (data?.estado ?? 'error') as ResultadoSolicitud;
  }

  async validar(codigo: string): Promise<ResultadoValidacion> {
    if (environment.modoDemo) return this.validarDemo(codigo);
    const { data, error } = await this.supabase.client.rpc('validar_codigo', { p_codigo: codigo });
    if (error) { console.error(error); return { valido: false, motivo: 'error' }; }
    return data as ResultadoValidacion;
  }

  async canjear(codigo: string): Promise<boolean> {
    if (environment.modoDemo) return this.canjearDemo(codigo);
    const { data, error } = await this.supabase.client.rpc('canjear_codigo', { p_codigo: codigo });
    if (error) console.error(error);
    return data === true;
  }

  // ---------- modo demo ----------
  private buscarDemo(codigo: string) {
    const c = normalizarCodigo(codigo);
    return this.clientes.clientes().find(cl => cl.codigo?.codigo === c);
  }

  private solicitarDemo(d: DatosCliente): ResultadoSolicitud {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return 'email_invalido';
    const existente = this.clientes.clientes().find(c => c.email.toLowerCase() === d.email.toLowerCase());
    if (existente?.codigo?.usado_at) return 'usado';
    if (existente?.codigo && estadoDeCodigo(existente.codigo) === 'vigente') return 'espera';

    const ahora = new Date();
    const codigo = {
      codigo: generarCodigoDemo(),
      creado_at: ahora.toISOString(),
      expira_at: new Date(ahora.getTime() + DIAS_VIGENCIA * 86_400_000).toISOString(),
      usado_at: null,
    };
    this.clientes.clientes.update(lista =>
      existente ? lista.map(c => (c === existente ? { ...c, codigo } : c)) : [{ ...d, codigo }, ...lista],
    );
    return existente ? 'renovado' : 'nuevo';
  }

  private validarDemo(codigo: string): ResultadoValidacion {
    const cliente = this.buscarDemo(codigo);
    if (!cliente?.codigo) return { valido: false, motivo: 'inexistente' };
    const estado = estadoDeCodigo(cliente.codigo);
    return estado === 'vigente' ? { valido: true } : { valido: false, motivo: estado };
  }

  private canjearDemo(codigo: string): boolean {
    const cliente = this.buscarDemo(codigo);
    if (!cliente?.codigo || estadoDeCodigo(cliente.codigo) !== 'vigente') return false;
    this.clientes.clientes.update(lista =>
      lista.map(c => (c === cliente ? { ...c, codigo: { ...c.codigo!, usado_at: new Date().toISOString() } } : c)),
    );
    return true;
  }
}
