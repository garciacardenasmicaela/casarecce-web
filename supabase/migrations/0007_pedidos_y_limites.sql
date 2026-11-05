-- 0007 · Historial de pedidos, WhatsApp del cliente y límite de intentos.
-- Incluye la 0006 (alta pública de clientes más estricta). Es seguro ejecutarla más de una vez.

-- ---------- 0006: la web solo puede dejar nombre / WhatsApp / email ----------
drop policy if exists "public insert clientes" on clientes;
create policy "public insert clientes" on clientes
  for insert to anon, authenticated
  with check (
    descuento_usado = false
    and dni is null
    and char_length(trim(nombre)) between 1 and 120
    and (whatsapp is null or char_length(whatsapp) <= 40)
    and (email is null or char_length(email) <= 200)
  );

-- ---------- Límite de intentos por IP ----------
create table if not exists limite_intentos (
  clave text primary key,
  ventana_inicio timestamptz not null default now(),
  intentos int not null default 0
);
alter table limite_intentos enable row level security; -- sin policies: solo las funciones de abajo la usan

-- true = puede seguir; false = demasiados intentos en la ventana. Sin IP conocida no limita.
create or replace function permitir_intento(p_accion text, p_max int, p_segundos int) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_headers json := nullif(current_setting('request.headers', true), '')::json;
  v_ip text := nullif(trim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), '');
  v_clave text;
  v_n int;
begin
  if v_ip is null then return true; end if;
  v_clave := p_accion || ':' || v_ip;

  insert into limite_intentos (clave, ventana_inicio, intentos) values (v_clave, now(), 1)
  on conflict (clave) do update set
    intentos = case when limite_intentos.ventana_inicio < now() - make_interval(secs => p_segundos)
                    then 1 else limite_intentos.intentos + 1 end,
    ventana_inicio = case when limite_intentos.ventana_inicio < now() - make_interval(secs => p_segundos)
                          then now() else limite_intentos.ventana_inicio end
  returning intentos into v_n;

  if random() < 0.02 then delete from limite_intentos where ventana_inicio < now() - interval '1 day'; end if;
  return v_n <= p_max;
end $$;
revoke all on function permitir_intento(text, int, int) from public;

-- ---------- Códigos de 10% OFF con límite de intentos ----------
create or replace function solicitar_codigo(p_nombre text, p_dni text, p_email text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_dni text := regexp_replace(coalesce(p_dni, ''), '\D', '', 'g');
  v_cliente clientes%rowtype;
  v_codigo codigos_descuento%rowtype;
begin
  if not permitir_intento('solicitar', 5, 600) then
    return jsonb_build_object('estado', 'demasiados_intentos');
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('estado', 'email_invalido');
  end if;
  if v_dni !~ '^\d{7,8}$' then
    return jsonb_build_object('estado', 'dni_invalido');
  end if;

  select * into v_cliente from clientes where dni = v_dni;
  if found then
    if lower(coalesce(v_cliente.email, '')) <> v_email then
      return jsonb_build_object('estado', 'dni_registrado');
    end if;
  else
    select * into v_cliente from clientes where lower(email) = v_email;
    if found then
      if v_cliente.dni is not null then
        return jsonb_build_object('estado', 'email_en_uso');
      end if;
      update clientes set dni = v_dni where id = v_cliente.id returning * into v_cliente;
    else
      insert into clientes (nombre, dni, email)
      values (left(trim(coalesce(p_nombre, '')), 120), v_dni, v_email)
      returning * into v_cliente;
    end if;
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
    update codigos_descuento
       set codigo = generar_codigo(), creado_at = now(), expira_at = now() + interval '7 days', ultimo_envio_at = now()
     where id = v_codigo.id;
    return jsonb_build_object('estado', 'renovado');
  end if;
  if v_codigo.ultimo_envio_at > now() - interval '10 minutes' then
    return jsonb_build_object('estado', 'espera');
  end if;
  update codigos_descuento set ultimo_envio_at = now() where id = v_codigo.id;
  return jsonb_build_object('estado', 'reenviado');
end $$;

create or replace function validar_codigo(p_codigo text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v codigos_descuento%rowtype;
begin
  if not permitir_intento('validar', 15, 600) then
    return jsonb_build_object('valido', false, 'motivo', 'demasiados_intentos');
  end if;
  select * into v from codigos_descuento where codigo = normalizar_codigo(p_codigo);
  if not found then return jsonb_build_object('valido', false, 'motivo', 'inexistente'); end if;
  if v.usado_at is not null then return jsonb_build_object('valido', false, 'motivo', 'usado'); end if;
  if v.expira_at <= now() then return jsonb_build_object('valido', false, 'motivo', 'vencido'); end if;
  return jsonb_build_object('valido', true, 'expira_at', v.expira_at);
end $$;

create or replace function canjear_codigo(p_codigo text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_cliente uuid;
begin
  if not permitir_intento('canjear', 10, 600) then return false; end if;
  update codigos_descuento set usado_at = now()
   where codigo = normalizar_codigo(p_codigo) and usado_at is null and expira_at > now()
  returning cliente_id into v_cliente;
  if v_cliente is null then return false; end if;
  update clientes set descuento_usado = true where id = v_cliente;
  return true;
end $$;

-- ---------- Historial de pedidos ----------
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  cliente_id uuid references clientes(id) on delete set null,
  nombre text not null,
  whatsapp text not null,
  email text,
  items jsonb not null,                       -- [{ nombre, cantidad, precio }]
  subtotal numeric(12,2) not null check (subtotal >= 0),
  descuento numeric(12,2) not null default 0 check (descuento >= 0),
  total numeric(12,2) not null check (total >= 0),
  codigo_descuento text,
  cuando text,
  entrega text not null,
  pago text not null,
  notas text,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'confirmado', 'entregado', 'cancelado')),
  created_at timestamptz not null default now()
);
create index if not exists pedidos_created_idx on pedidos (created_at desc);
alter table pedidos enable row level security;

drop policy if exists "admin all pedidos" on pedidos;
create policy "admin all pedidos" on pedidos
  for all to authenticated using (es_admin()) with check (es_admin());
-- Sin policy pública: la web solo escribe a través de registrar_pedido.

-- La web llama a esta función al enviar el pedido por WhatsApp: guarda el pedido y completa la ficha del cliente
-- (incluido su WhatsApp, aunque haya pedido antes el 10% con otro dato).
create or replace function registrar_pedido(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_nombre text := left(trim(coalesce(p ->> 'nombre', '')), 120);
  v_wa text := left(trim(coalesce(p ->> 'whatsapp', '')), 40);
  v_wa_digitos text := regexp_replace(v_wa, '\D', '', 'g');
  v_email text := nullif(lower(left(trim(coalesce(p ->> 'email', '')), 200)), '');
  v_items jsonb := p -> 'items';
  v_total numeric := coalesce((p ->> 'total')::numeric, 0);
  v_cliente clientes%rowtype;
begin
  if not permitir_intento('pedido', 10, 600) then return jsonb_build_object('ok', false, 'motivo', 'demasiados_intentos'); end if;
  if v_nombre = '' or length(v_wa_digitos) < 8 then return jsonb_build_object('ok', false, 'motivo', 'datos_invalidos'); end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) not between 1 and 60 then
    return jsonb_build_object('ok', false, 'motivo', 'datos_invalidos');
  end if;
  if v_total <= 0 or v_total > 10000000 then return jsonb_build_object('ok', false, 'motivo', 'datos_invalidos'); end if;

  -- Ficha del cliente: se busca por email o por WhatsApp; si falta el WhatsApp, se completa
  select * into v_cliente from clientes
   where (v_email is not null and lower(email) = v_email)
      or regexp_replace(coalesce(whatsapp, ''), '\D', '', 'g') = v_wa_digitos
   limit 1;
  if found then
    if v_cliente.whatsapp is null then
      begin
        update clientes set whatsapp = v_wa where id = v_cliente.id;
      exception when unique_violation then null;
      end;
    end if;
  else
    begin
      insert into clientes (nombre, whatsapp, email) values (v_nombre, v_wa, v_email) returning * into v_cliente;
    exception when unique_violation then v_cliente.id := null;
    end;
  end if;

  insert into pedidos (numero, cliente_id, nombre, whatsapp, email, items, subtotal, descuento, total,
                       codigo_descuento, cuando, entrega, pago, notas)
  values (left(coalesce(p ->> 'numero', ''), 20), v_cliente.id, v_nombre, v_wa, v_email, v_items,
          coalesce((p ->> 'subtotal')::numeric, v_total), coalesce((p ->> 'descuento')::numeric, 0), v_total,
          nullif(left(coalesce(p ->> 'codigo_descuento', ''), 12), ''), left(coalesce(p ->> 'cuando', ''), 120),
          left(coalesce(p ->> 'entrega', ''), 60), left(coalesce(p ->> 'pago', ''), 60),
          nullif(left(coalesce(p ->> 'notas', ''), 500), ''));
  return jsonb_build_object('ok', true);
end $$;

revoke all on function solicitar_codigo(text, text, text) from public;
revoke all on function validar_codigo(text) from public;
revoke all on function canjear_codigo(text) from public;
revoke all on function registrar_pedido(jsonb) from public;
grant execute on function solicitar_codigo(text, text, text) to anon, authenticated;
grant execute on function validar_codigo(text) to anon, authenticated;
grant execute on function canjear_codigo(text) to anon, authenticated;
grant execute on function registrar_pedido(jsonb) to anon, authenticated;
