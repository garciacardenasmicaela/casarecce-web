// Edge Function de Supabase: envía por email el código de 10% OFF.
// Se dispara con un Database Webhook sobre la tabla `codigos_descuento` (INSERT y UPDATE).
// Funciona igual con el flujo por DNI: el código se genera en `solicitar_codigo` y el mail va al email del cliente.
// Proveedor: Brevo (plan gratis: 300 mails por día, no exige tener dominio propio).
//
// Secretos necesarios (supabase secrets set ...):
//   BREVO_API_KEY      clave de la API de Brevo
//   REMITENTE_EMAIL    el mail que verificaste como remitente en Brevo
//   REMITENTE_NOMBRE   (opcional) por defecto "Casarecce"
//   SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya vienen incluidos en las Edge Functions.

import { createClient } from 'npm:@supabase/supabase-js@2';

// El nombre lo escribe el cliente: se escapa antes de ponerlo en el HTML del mail
const escapar = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

Deno.serve(async req => {
  const { record } = await req.json(); // fila de codigos_descuento
  if (!record?.codigo || record.usado_at) return new Response('nada que enviar');

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: cliente } = await supabase.from('clientes').select('nombre, email').eq('id', record.cliente_id).single();
  if (!cliente?.email) return new Response('cliente sin email');

  const codigo = `${record.codigo.slice(0, 4)}-${record.codigo.slice(4)}`;
  const vence = new Date(record.expira_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' });

  const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': Deno.env.get('BREVO_API_KEY')!, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: Deno.env.get('REMITENTE_NOMBRE') ?? 'Casarecce', email: Deno.env.get('REMITENTE_EMAIL') },
      to: [{ email: cliente.email, name: cliente.nombre }],
      subject: 'Tu código de 10% OFF en Casarecce 🍝',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#3C3847">
          <h2 style="color:#DD1323">¡Hola ${escapar(cliente.nombre || '')}!</h2>
          <p>Gracias por sumarte a Casarecce. Este es tu código de <b>10% OFF en tu primera compra</b>:</p>
          <p style="font-size:32px;letter-spacing:4px;font-weight:bold;background:#F3ECE1;padding:16px;text-align:center;border-radius:12px">${codigo}</p>
          <p>Ingresalo en la web desde "10% OFF 1ª Compra" → "Ya tengo mi código".<br>
          Es de <b>un solo uso</b> y vence el <b>${vence}</b>.</p>
          <p style="font-size:12px;color:#888">Dulces &amp; Pastas Artesanales · San Miguel de Tucumán</p>
        </div>`,
    }),
  });
  return new Response(await respuesta.text(), { status: respuesta.status });
});
