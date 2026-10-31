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
