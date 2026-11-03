// La URL y la publishable key de Supabase son públicas (van en el navegador).
// NUNCA poner acá la service_role key ni la contraseña de la base.
export const environment = {
  production: false,
  // true = datos de prueba y admin sin login (solo desarrollo). false = Supabase real
  modoDemo: false,
  supabaseUrl: 'https://nqapfokapniihohysbbb.supabase.co',
  supabaseKey: 'sb_publishable_saJBdIKNhYTeZzMyXeG12A_H0DYPjAG',
  whatsappLocal: '5493812102630',
  // true cuando la Edge Function enviar-codigo está desplegada (ver README). Mientras sea false, el local envía el código por WhatsApp desde el panel.
  envioEmailAutomatico: false,
  // true cuando Supabase Auth tiene SMTP propio y la plantilla "Magic link or OTP" muestra {{ .Token }} (ver README).
  loginPorCodigo: false,
};
