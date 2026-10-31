-- Códigos de 10% OFF en la primera compra.
-- Reglas: se genera por cliente (un solo código por persona, un solo uso) y vence a los 7 días como máximo.
-- Es seguro ejecutarla más de una vez.

create table if not exists codigos_descuento (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null unique references clientes(id) on delete cascade, -- 1 código por cliente
  codigo text not null unique,                       -- 8 caracteres, sin guiones (se muestra XXXX-XXXX)
  creado_at timestamptz not null default now(),
  expira_at timestamptz not null default now() + interval '7 days',
  usado_at timestamptz,                              -- null = todavía no se usó
  ultimo_envio_at timestamptz not null default now(),-- evita reenviar el mail en loop
  constraint vigencia_maxima_7_dias check (expira_at <= creado_at + interval '7 days')
);

alter table codigos_descuento enable row level security;

drop policy if exists "admin all codigos_descuento" on codigos_descuento;
create policy "admin all codigos_descuento" on codigos_descuento
  for all to authenticated using (es_admin()) with check (es_admin());
-- Sin policy pública: los clientes solo operan a través de las funciones de abajo.

-- ---------- utilidades ----------
create or replace function normalizar_codigo(p text) returns text
language sql immutable as $$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

-- Código aleatorio de 8 caracteres sin letras confusas (sin 0, O, 1, I, L)
create or replace function generar_codigo() returns text
language plpgsql as $$
declare
  alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- 31 símbolos
  bytes bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  resultado text := '';
  i int;
begin
  for i in 0..7 loop
    resultado := resultado || substr(alfabeto, (get_byte(bytes, i) % 31) + 1, 1);
  end loop;
  return resultado;
end $$;

-- ---------- 1) El cliente pide su código ----------
-- Devuelve solo el estado: el código NO viaja al navegador, llega por email/WhatsApp.
create or replace function solicitar_codigo(p_nombre text, p_whatsapp text, p_email text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_wa text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  v_cliente clientes%rowtype;
  v_codigo codigos_descuento%rowtype;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('estado', 'email_invalido');
  end if;

  select * into v_cliente from clientes
   where lower(email) = v_email
      or (v_wa <> '' and regexp_replace(coalesce(whatsapp, ''), '\D', '', 'g') = v_wa)
   limit 1;

  if not found then
    insert into clientes (nombre, whatsapp, email)
    values (trim(coalesce(p_nombre, '')), nullif(v_wa, ''), v_email)
    returning * into v_cliente;
  end if;

  select * into v_codigo from codigos_descuento where cliente_id = v_cliente.id;

  if not found then
    insert into codigos_descuento (cliente_id, codigo) values (v_cliente.id, generar_codigo());
    return jsonb_build_object('estado', 'nuevo');
  end if;

  if v_codigo.usado_at is not null then
    return jsonb_build_object('estado', 'usado');
  end if;

  if v_codigo.expira_at <= now() then
    -- Venció sin usarse: se renueva (sigue siendo un único uso por persona)
    update codigos_descuento
       set codigo = generar_codigo(), creado_at = now(), expira_at = now() + interval '7 days', ultimo_envio_at = now()
     where id = v_codigo.id;
    return jsonb_build_object('estado', 'renovado');
  end if;

  if v_codigo.ultimo_envio_at > now() - interval '10 minutes' then
    return jsonb_build_object('estado', 'espera');
  end if;

  update codigos_descuento set ultimo_envio_at = now() where id = v_codigo.id; -- dispara el reenvío del mail
  return jsonb_build_object('estado', 'reenviado');
end $$;

-- ---------- 2) El cliente aplica su código en el carrito ----------
create or replace function validar_codigo(p_codigo text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v codigos_descuento%rowtype;
begin
  select * into v from codigos_descuento where codigo = normalizar_codigo(p_codigo);
  if not found then return jsonb_build_object('valido', false, 'motivo', 'inexistente'); end if;
  if v.usado_at is not null then return jsonb_build_object('valido', false, 'motivo', 'usado'); end if;
  if v.expira_at <= now() then return jsonb_build_object('valido', false, 'motivo', 'vencido'); end if;
  return jsonb_build_object('valido', true, 'expira_at', v.expira_at);
end $$;

-- ---------- 3) Se canjea al confirmar el pedido (atómico: no se puede usar dos veces) ----------
create or replace function canjear_codigo(p_codigo text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_cliente uuid;
begin
  update codigos_descuento set usado_at = now()
   where codigo = normalizar_codigo(p_codigo) and usado_at is null and expira_at > now()
  returning cliente_id into v_cliente;

  if v_cliente is null then return false; end if;
  update clientes set descuento_usado = true where id = v_cliente;
  return true;
end $$;

revoke all on function solicitar_codigo(text, text, text) from public;
revoke all on function validar_codigo(text) from public;
revoke all on function canjear_codigo(text) from public;
grant execute on function solicitar_codigo(text, text, text) to anon, authenticated;
grant execute on function validar_codigo(text) to anon, authenticated;
grant execute on function canjear_codigo(text) to anon, authenticated;
