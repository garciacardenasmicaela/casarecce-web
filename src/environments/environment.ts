// La URL y la publishable key de Supabase son públicas (van en el navegador).
// NUNCA poner acá la service_role key ni la contraseña de la base.
export const environment = {
  production: false,
  // true = datos de prueba y admin sin login (solo desarrollo). false = Supabase real
  modoDemo: false,
  supabaseUrl: 'https://nqapfokapniihohysbbb.supabase.co',
  supabaseKey: 'sb_publishable_saJBdIKNhYTeZzMyXeG12A_H0DYPjAG',
  whatsappLocal: '5493815267382',
};
