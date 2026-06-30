-- RLS de EventRank. Aplicado contra el proyecto Supabase "Aniversarios" (xxpzfttcnevyhnztgrun)
-- vía el MCP de Supabase. Este archivo es la copia versionada de referencia.
--
-- Roles relevantes:
--   service_role    -> usado por Drizzle (DATABASE_URL) y por los scripts admin. Bypassea RLS.
--                       La proteccion multi-tenant en ese camino la dan los WHERE tenant_id
--                       explicitos en cada query (ver Constitucion §4.2 y RN-M04).
--   authenticated   -> Supabase JS client con el JWT de Clerk (template "supabase").
--   anon            -> portal publico (/e/[slug]) y Supabase Realtime sin login.

-- ============================================================
-- Funciones helper para leer claims del JWT de Clerk
-- ============================================================

create or replace function requesting_user_id()
returns text
language sql stable
set search_path = ''
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$;

create or replace function requesting_tenant_id()
returns uuid
language sql stable
set search_path = ''
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::json->'publicMetadata'->>'tenant_id',
    ''
  )::uuid;
$$;

create or replace function requesting_rol()
returns text
language sql stable
set search_path = ''
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::json->'publicMetadata'->>'rol',
    ''
  )::text;
$$;

-- ============================================================
-- tenants: sin acceso anon. authenticated solo lee su propio tenant (o todos si super_admin).
-- ============================================================

create policy "tenants_select_own_or_admin" on tenants
for select to authenticated
using (id = requesting_tenant_id() or requesting_rol() = 'super_admin');

-- ============================================================
-- eventos: anon ve activo/finalizado (portal publico). authenticated CRUD en su tenant.
-- ============================================================

create policy "eventos_anon_select_publico" on eventos
for select to anon
using (estado in ('activo', 'finalizado'));

create policy "eventos_authenticated_select" on eventos
for select to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "eventos_authenticated_insert" on eventos
for insert to authenticated
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "eventos_authenticated_update" on eventos
for update to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin')
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "eventos_authenticated_delete" on eventos
for delete to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

-- ============================================================
-- grupos: anon ve solo activos de eventos publicos.
-- ============================================================

create policy "grupos_anon_select_publico" on grupos
for select to anon
using (
  activo = true
  and exists (select 1 from eventos e where e.id = grupos.evento_id and e.estado in ('activo', 'finalizado'))
);

create policy "grupos_authenticated_select" on grupos
for select to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "grupos_authenticated_insert" on grupos
for insert to authenticated
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "grupos_authenticated_update" on grupos
for update to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin')
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "grupos_authenticated_delete" on grupos
for delete to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

-- ============================================================
-- escalas_puntaje
-- ============================================================

create policy "escalas_anon_select_publico" on escalas_puntaje
for select to anon
using (
  exists (select 1 from eventos e where e.id = escalas_puntaje.evento_id and e.estado in ('activo', 'finalizado'))
);

create policy "escalas_authenticated_select" on escalas_puntaje
for select to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "escalas_authenticated_insert" on escalas_puntaje
for insert to authenticated
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "escalas_authenticated_update" on escalas_puntaje
for update to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin')
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "escalas_authenticated_delete" on escalas_puntaje
for delete to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

-- ============================================================
-- actividades
-- ============================================================

create policy "actividades_anon_select_publico" on actividades
for select to anon
using (
  exists (select 1 from eventos e where e.id = actividades.evento_id and e.estado in ('activo', 'finalizado'))
);

create policy "actividades_authenticated_select" on actividades
for select to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "actividades_authenticated_insert" on actividades
for insert to authenticated
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "actividades_authenticated_update" on actividades
for update to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin')
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "actividades_authenticated_delete" on actividades
for delete to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

-- ============================================================
-- horarios
-- ============================================================

create policy "horarios_anon_select_publico" on horarios
for select to anon
using (
  exists (select 1 from eventos e where e.id = horarios.evento_id and e.estado in ('activo', 'finalizado'))
);

create policy "horarios_authenticated_select" on horarios
for select to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "horarios_authenticated_insert" on horarios
for insert to authenticated
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "horarios_authenticated_update" on horarios
for update to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin')
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "horarios_authenticated_delete" on horarios
for delete to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

-- ============================================================
-- reglas_generales: anon ve solo visible = true de eventos publicos.
-- ============================================================

create policy "reglas_anon_select_visibles" on reglas_generales
for select to anon
using (
  visible = true
  and exists (select 1 from eventos e where e.id = reglas_generales.evento_id and e.estado in ('activo', 'finalizado'))
);

create policy "reglas_authenticated_select" on reglas_generales
for select to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "reglas_authenticated_insert" on reglas_generales
for insert to authenticated
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "reglas_authenticated_update" on reglas_generales
for update to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin')
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "reglas_authenticated_delete" on reglas_generales
for delete to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

-- ============================================================
-- puntajes: RN-01, solo publico = true es visible para anon. Critico para Realtime.
-- ============================================================

create policy "puntajes_anon_select_publicos" on puntajes
for select to anon
using (
  publico = true
  and exists (select 1 from eventos e where e.id = puntajes.evento_id and e.estado in ('activo', 'finalizado'))
);

create policy "puntajes_authenticated_select" on puntajes
for select to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "puntajes_authenticated_insert" on puntajes
for insert to authenticated
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "puntajes_authenticated_update" on puntajes
for update to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin')
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "puntajes_authenticated_delete" on puntajes
for delete to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

-- ============================================================
-- pagos: sin acceso anon en absoluto.
-- ============================================================

create policy "pagos_authenticated_select" on pagos
for select to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "pagos_authenticated_insert" on pagos
for insert to authenticated
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "pagos_authenticated_update" on pagos
for update to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin')
with check (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');

create policy "pagos_authenticated_delete" on pagos
for delete to authenticated
using (tenant_id = requesting_tenant_id() or requesting_rol() = 'super_admin');
