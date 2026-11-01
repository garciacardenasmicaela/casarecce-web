import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard: CanActivateFn = async () => {
  if (environment.modoDemo) return true; // solo desarrollo

  // inject() solo funciona antes del primer await: se piden las dependencias primero
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabase.getSession();
  if (session && (await supabase.esAdmin())) return true;
  return router.createUrlTree(['/admin/login']);
};
