-- Endurece el alta pública de clientes: la web solo puede dejar nombre / WhatsApp / email.
-- Antes cualquiera podía insertar filas con cualquier valor (por ejemplo descuento_usado o dni a medida).
-- El DNI y los códigos solo se crean por la función solicitar_codigo. Es seguro ejecutarla más de una vez.

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
