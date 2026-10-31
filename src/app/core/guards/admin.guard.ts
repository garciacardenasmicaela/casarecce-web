import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard: CanActivateFn = async () => {
  if (environment.modoDemo) return true; // solo desarrollo
  const supabase = inject(SupabaseService);
  const session = await supabase.getSession();
  if (session && (await supabase.esAdmin())) return true;
  return inject(Router).createUrlTree(['/admin/login']);
};
