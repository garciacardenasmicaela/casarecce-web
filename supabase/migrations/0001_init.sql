-- Casarecce-web · esquema inicial (v2: stock por unidades)

create table productos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('pastas','freezados','dulces')),
  nombre text not null,
  descripcion text not null default '',
  precio numeric(12,2) not null check (precio > 0),
  porciones text not null default '',
  imagen_url text,
  stock int not null default 0 check (stock >= 0), -- unidades disponibles hoy (0 = agotado)
  created_at timestamptz not null default now()
);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  whatsapp text,
  email text,
  descuento_usado boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index clientes_whatsapp_uq on clientes (whatsapp) where whatsapp is not null;
create unique index clientes_email_uq on clientes (lower(email)) where email is not null;

-- Una sola fila: estado del local en vivo
create table local_config (
  id int primary key default 1 check (id = 1),
  estado text not null default 'abierto'
    check (estado in ('abierto','cerrado','encargos_fin_de_semana'))
);
insert into local_config (id) values (1);

create table novedades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensaje text not null,
  enviada_at timestamptz,
  created_at timestamptz not null default now()
);

-- Dueños del local autorizados a usar el panel
create table admins (email text primary key);

create function es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function es_admin() to anon, authenticated;

-- RLS
alter table productos    enable row level security;
alter table clientes     enable row level security;
alter table local_config enable row level security;
alter table novedades    enable row level security;
alter table admins       enable row level security; -- sin policies: nadie la toca desde la API

-- Público: ver catálogo y estado del local; dejar sus datos al pedir
create policy "public read productos"    on productos    for select using (true);
create policy "public read local_config" on local_config for select using (true);
create policy "public insert clientes"   on clientes     for insert with check (true);

-- Solo admins: todo lo demás (los clientes que entran con Google/Facebook NO son admins)
create policy "admin all productos"    on productos    for all to authenticated using (es_admin()) with check (es_admin());
create policy "admin all clientes"     on clientes     for all to authenticated using (es_admin()) with check (es_admin());
create policy "admin all local_config" on local_config for all to authenticated using (es_admin()) with check (es_admin());
create policy "admin all novedades"    on novedades    for all to authenticated using (es_admin()) with check (es_admin());

-- IMPORTANTE: autorizar al/los dueño(s). Reemplazar por el email real del usuario creado
-- en Authentication → Users y ejecutar:
-- insert into admins (email) values ('dueno@ejemplo.com');
