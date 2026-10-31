import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ESTADOS_LOCAL } from '../config/local.config';
import { EstadoLocal } from '../models';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class StoreStatusService {
  private readonly supabase = inject(SupabaseService);

  readonly estado = signal<EstadoLocal>('abierto');
  readonly etiqueta = computed(() => ESTADOS_LOCAL.find(e => e.valor === this.estado())!.etiqueta);

  constructor() {
    if (!environment.modoDemo) void this.cargar();
  }

  async cargar() {
    const { data } = await this.supabase.client.from('local_config').select('estado').eq('id', 1).maybeSingle();
    if (data) this.estado.set(data.estado as EstadoLocal);
  }

  async cambiar(estado: EstadoLocal): Promise<boolean> {
    if (!environment.modoDemo) {
      const { data, error } = await this.supabase.client.from('local_config').update({ estado }).eq('id', 1).select('id');
      if (error || !data?.length) return false;
    }
    this.estado.set(estado);
    return true;
  }
}
