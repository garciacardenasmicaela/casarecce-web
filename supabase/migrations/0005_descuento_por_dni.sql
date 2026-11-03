-- El 10% OFF de primera compra se controla por DNI (un solo código por persona, aunque use varios emails).
-- Es seguro ejecutarla más de una vez.

alter table clientes add column if not exists dni text;
-- Un DNI = un cliente (el DNI se guarda normalizado: solo dígitos)
create unique index if not exists clientes_dni_uq on clientes (dni) where dni is not null;

-- Cambia el segundo parámetro (antes WhatsApp, ahora DNI): hay que borrar la versión anterior
drop function if exists solicitar_codigo(text, text, text);

-- Devuelve solo el estado: el código NO viaja al navegador, llega por email.
-- Estados: nuevo | renovado | reenviado | espera | usado | email_invalido | dni_invalido | dni_registrado | email_en_uso
create or replace function solicitar_codigo(p_nombre text, p_dni text, p_email text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_dni text := regexp_replace(coalesce(p_dni, ''), '\D', '', 'g');
  v_cliente clientes%rowtype;
  v_codigo codigos_descuento%rowtype;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('estado', 'email_invalido');
  end if;
  if v_dni !~ '^\d{7,8}$' then
    return jsonb_build_object('estado', 'dni_invalido');
  end if;

  select * into v_cliente from clientes where dni = v_dni;

  if found then
    -- Ese DNI ya pidió su código: el código solo va al email con el que se registró por primera vez
    if lower(coalesce(v_cliente.email, '')) <> v_email then
      return jsonb_build_object('estado', 'dni_registrado');
    end if;
  else
    -- DNI nuevo: si el email ya existe sin DNI (ej. pidió antes por la web), se completa; si tiene otro DNI, se rechaza
    select * into v_cliente from clientes where lower(email) = v_email;
    if found then
      if v_cliente.dni is not null then
        return jsonb_build_object('estado', 'email_en_uso');
      end if;
      update clientes set dni = v_dni where id = v_cliente.id returning * into v_cliente;
    else
      insert into clientes (nombre, dni, email)
      values (trim(coalesce(p_nombre, '')), v_dni, v_email)
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

  update codigos_descuento set ultimo_envio_at = now() where id = v_codigo.id; -- dispara el reenvío del mail
  return jsonb_build_object('estado', 'reenviado');
end $$;

revoke all on function solicitar_codigo(text, text, text) from public;
grant execute on function solicitar_codigo(text, text, text) to anon, authenticated;
