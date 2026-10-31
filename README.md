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
- El código nunca viaja al navegador del cliente: se ve en el panel admin (Clientes) y se entrega por WhatsApp o email.
- **Envío automático por email (opcional, gratis):** `supabase/functions/enviar-codigo` + Brevo.
  1. Crear cuenta en Brevo, verificar un remitente y copiar la API key.
  2. `supabase secrets set BREVO_API_KEY=... REMITENTE_EMAIL=...` y `supabase functions deploy enviar-codigo`.
  3. En Supabase → Database → Webhooks: crear uno sobre `codigos_descuento` (INSERT y UPDATE) que llame a la función.
  4. Poner `envioEmailAutomatico: true` en `environment.ts`.
