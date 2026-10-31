import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Novedad } from '../models';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class NovedadesService {
  private readonly supabase = inject(SupabaseService);

  async guardar(novedad: Novedad): Promise<boolean> {
    if (environment.modoDemo) return true;
    const { error } = await this.supabase.client
      .from('novedades')
      .insert({ titulo: novedad.titulo, mensaje: novedad.mensaje });
    if (error) console.error(error);
    return !error;
  }
}
