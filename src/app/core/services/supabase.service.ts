import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);

  async getSession() {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  /** ¿El usuario logueado figura en la tabla `admins`? */
  async esAdmin(): Promise<boolean> {
    const { data, error } = await this.client.rpc('es_admin');
    return !error && data === true;
  }

  signInWithPassword(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  // Ingreso social del cliente (Google / Facebook / Apple)
  signInWithProvider(provider: 'google' | 'facebook' | 'apple') {
    return this.client.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  }

  signOut() {
    return this.client.auth.signOut();
  }
}
