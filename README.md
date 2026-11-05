# Casarecce-web

Sitio web y catálogo online de Casarecce. Angular + Angular Material + Supabase.

## Puesta en marcha
1. `npm install`
2. Completar `src/environments/environment.ts` (URL y anon key de Supabase, WhatsApp del local).
3. Ejecutar `supabase/migrations/0001_init.sql` en el SQL Editor de Supabase.
4. `npm start` → http://localhost:4200

## Estructura
- `src/app/core` · servicio de Supabase, guard del admin, modelos
- `src/app/shared` · componentes reutilizables
- `src/app/features/home` · inicio, bienvenida 10%, estado del local
- `src/app/features/catalogo` · categorías y tarjetas de producto
- `src/app/features/carrito` · pedido y envío por WhatsApp
- `src/app/features/local-info` · quiénes somos, ubicación, horarios, redes
- `src/app/features/admin` · login, stock/precios, clientes, novedades por email
- `supabase/migrations` · esquema SQL

## Actualización v2 (stock por unidades + fotos)
Si ya ejecutaste `0001` y `0002` de la versión anterior, ejecutá además en el SQL Editor de Supabase:
`supabase/migrations/0003_stock_por_unidades_y_fotos.sql` (pasa `disponible` a `stock` y crea el bucket `productos` para las fotos).
Es seguro correrla más de una vez.

## Códigos de 10% OFF (primera compra)
- Migración: `supabase/migrations/0004_codigos_descuento.sql` (ya ejecutada en el proyecto).
- Cada cliente tiene **un solo código**, de **un solo uso**, que **vence a los 7 días** (la base lo garantiza).
- El código nunca viaja al navegador del cliente: se ve en el panel admin (Clientes) y se entrega por email. El beneficio se controla por DNI (migración 0005): un DNI = un código, aunque use varios emails.
- **Envío automático por email (opcional, gratis):** `supabase/functions/enviar-codigo` + Brevo.
  1. Crear cuenta en Brevo, verificar un remitente y copiar la API key.
  2. `supabase secrets set BREVO_API_KEY=... REMITENTE_EMAIL=...` y `supabase functions deploy enviar-codigo`.
  3. En Supabase → Database → Webhooks: crear uno sobre `codigos_descuento` (INSERT y UPDATE) que llame a la función.
  4. Poner `envioEmailAutomatico: true` en `environment.ts`.

## Inicio de sesión del admin
- **Email + contraseña:** funciona ya. Los 3 admins se crean en Supabase → Authentication → Users y se autorizan en la tabla `admins`.
- **Email + código de verificación:** el código ya está listo en la pantalla de login, pero Supabase no deja editar la plantilla de mails sin SMTP propio. Para activarlo:
  1. Supabase → Authentication → Emails → SMTP Settings: cargar el SMTP de Brevo (el mismo servicio del envío de códigos de descuento).
  2. En la plantilla "Magic link or OTP", mostrar el código con `{{ .Token }}`.
  3. Poner `loginPorCodigo: true` en `environment.ts`.
- **Olvidé mi contraseña:** el login tiene el enlace "Olvidé mi contraseña". Para que el mail de Supabase vuelva bien al sitio, agregá la URL de la web (ej. `https://tudominio.com/admin/login` y `http://localhost:4200/admin/login`) en Supabase → Authentication → URL Configuration → Redirect URLs.

## Pedidos, clientes y límite de intentos (migraciones 0006 y 0007)
Ejecutá en el SQL Editor `supabase/migrations/0007_pedidos_y_limites.sql` (incluye la 0006; se puede correr más de una vez). Agrega:
- Tabla `pedidos` y la función `registrar_pedido`: cada pedido enviado por WhatsApp queda en el historial del admin (pestaña **Pedidos**, con estados nuevo / confirmado / entregado / cancelado) y se completa el WhatsApp del cliente en su ficha.
- Límite de intentos por IP al pedir, validar y canjear códigos (5 pedidos de código, 15 validaciones y 10 canjes cada 10 minutos).
- Mientras no se ejecute, la web sigue funcionando: el pedido se envía igual y solo se guarda la ficha del cliente.

## Privacidad y términos
Las páginas `/privacidad` y `/terminos` usan los textos de `src/app/features/legal/legal.content.ts`. Son un modelo general (Ley 25.326): completá el titular (razón social, CUIT, domicilio, email) y revisalos con un profesional antes de publicar. El DNI es un dato personal: solo se pide para el beneficio de 10% OFF.

## Copias de seguridad
`.github/workflows/backup.yml` hace un volcado semanal de la base (se guarda 90 días como artefacto de GitHub Actions). Para activarlo: en GitHub → Settings → Secrets → Actions, crear `SUPABASE_DB_URL` con la cadena de conexión (Session pooler) de Supabase → Project Settings → Database. También se puede lanzar a mano desde la pestaña Actions.

## Medir rendimiento
Con la web publicada (o `npm run build` en tu compu y servir `dist/`), abrí Chrome → DevTools → Lighthouse y corré el análisis en modo móvil. Objetivo: Performance y Accesibilidad por encima de 90. Las fotos del admin se reducen solas (máx. 1200 px, WebP) al subirlas.
