-- Migración v2. Es segura de ejecutar más de una vez.
-- 1) Pasa de "disponible (sí/no)" a stock por unidades (solo si la base viene de la v1).
-- 2) Crea el bucket público "productos" para las fotos que sube el admin.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'productos' and column_name = 'disponible'
  ) then
    alter table productos add column if not exists stock int not null default 0 check (stock >= 0);
    update productos set stock = case nombre
      when 'Sorrentinos de Ternera Braseada y Albahaca' then 14
      when 'Ravioles de Espinaca, Ricota y Nuez' then 10
      when 'Tagliatelle al Huevo de Campo' then 18
      when 'Salsa Pomodoro Casera de la Nonna' then 15
      when 'Tarta Casera de Jamón Natural y Queso' then 4
      when 'Lasagna Bolognesa Lista para Hornear' then 0
      when 'Tarta Tradicional Italiana de Ricota' then 6
      when 'Torta Marquise con Dulce de Leche y Frutos Rojos' then 3
      else case when disponible then 10 else 0 end
    end;
    alter table productos drop column disponible;
  end if;
end $$;

-- Fotos de los platos
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

drop policy if exists "public read imagenes productos" on storage.objects;
create policy "public read imagenes productos" on storage.objects
  for select using (bucket_id = 'productos');

drop policy if exists "admin insert imagenes productos" on storage.objects;
create policy "admin insert imagenes productos" on storage.objects
  for insert to authenticated with check (bucket_id = 'productos' and public.es_admin());

drop policy if exists "admin update imagenes productos" on storage.objects;
create policy "admin update imagenes productos" on storage.objects
  for update to authenticated using (bucket_id = 'productos' and public.es_admin());

drop policy if exists "admin delete imagenes productos" on storage.objects;
create policy "admin delete imagenes productos" on storage.objects
  for delete to authenticated using (bucket_id = 'productos' and public.es_admin());
