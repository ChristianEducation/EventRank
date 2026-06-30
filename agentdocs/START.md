# EventRank — START

> Lo primero que lee el agente. Fuente de verdad operativa.

---

## Meta del martes

1. El organizador (CEAL) hace login con Clerk.
2. Crea su evento: grupos, escalas, actividades, horarios, bases.
3. Ingresa puntajes con modificadores y control público/privado.
4. El portal público `/e/[slug]` muestra ranking en tiempo real + actividades + horarios + bases.

Todo lo demás (pagos, registro self-service, multi-tenant comercial) → DIFERIDO.

---

## Stack definitivo

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Auth | **Clerk** (`app_3FkM9JG1BXuiMoI1yeoqJOgsogL`) |
| Base de datos | Supabase (PostgreSQL + Realtime) |
| ORM | Drizzle ORM |
| Estilos | Tailwind CSS + shadcn/ui |
| Diseño | **skill `ui-ux-pro-max`** (autoridad en UI/UX — ver `04-DESIGN.md`) |
| Validación | Zod + React Hook Form |
| Deploy | Vercel |

**Clerk maneja:** login, logout, sesión, usuarios, cambio de clave, recuperación de contraseña.
**Supabase maneja:** datos, RLS, Realtime.
**Los usuarios del CEAL** se crean en el dashboard de Clerk por Christian (super admin). No hay registro self-service.

---

## Variables de entorno necesarias

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...

# Seed
SEED_TENANT_EMAIL=...
```

---

## Orden de trabajo (bloques secuenciales)

### Bloque 0 — Setup del proyecto
```bash
npx create-next-app@latest eventrank --typescript --tailwind --app --src-dir --import-alias "@/*"
cd eventrank
clerk init --app app_3FkM9JG1BXuiMoI1yeoqJOgsogL
npx shadcn@latest init
```
Instalar dependencias:
```bash
npm install drizzle-orm drizzle-kit @supabase/supabase-js pg
npm install zod react-hook-form @hookform/resolvers
npm install sonner lucide-react
npm install @clerk/ui
```
Configurar Drizzle (`drizzle.config.ts`), cliente Supabase server/client, y `__clerk` en el middleware.

**Entregable:** `npm run dev` levanta, Clerk funciona, shadcn instalado.

---

### Bloque 1 — Schema + RLS + Seed
- Schema Drizzle completo (ver `01-DATA-MODEL.md`) — 9 tablas.
- `npm run db:push` → Christian lo ejecuta.
- SQL de RLS en Supabase (el agente genera el SQL, Christian lo corre en SQL Editor).
- Función `requesting_user_id()` para Clerk + RLS.
- Script seed: solo crea tenant Colegio San Luis (plan `interno`). Los usuarios los crea Christian en Clerk dashboard.

**Entregable:** tablas en Supabase + RLS activo + tenant San Luis en BD.

---

### Bloque 2 — Layout + Middleware + Roles
- Middleware con `clerkMiddleware()` protegiendo `/dashboard` y `/admin`.
- Helper `getCurrentUser()` que lee `auth()` de Clerk + busca `tenant_id` y `rol` desde metadata de Clerk.
- Layout del dashboard con sidebar de navegación.
- Layout del portal público (sin auth).
- Guard `/admin` solo para `rol === 'super_admin'`.

**Entregable:** login funciona, dashboard protegido, sidebar visible.

---

### Bloque 3 — Gestión del evento (orden estricto)
Eventos → Grupos → Escalas → Actividades → Horarios → Bases.
Un spec a la vez (ver `specs/`).

**Entregable:** el organizador arma un evento completo desde cero.

---

### Bloque 4 — Puntajes + Portal + Realtime
- Puntajes: ingresar/editar/toggle/ranking (ver `specs/puntajes.spec.md` — leer completo, es lo más delicado).
- Portal público: `/e/[slug]`, acceso por link/PIN, ranking, actividades, horarios, bases.
- Supabase Realtime: suscripción en `RankingTiempoReal.tsx`.
- Admin: activar evento sin pago.

**Gran hito:** crear evento → activar → link → publicar puntaje → ranking se actualiza solo en el portal.

---

### Bloque 5 — Pulido
- Loading states y skeletons.
- Manejo de errores en formularios.
- Responsive 375px mínimo.
- PWA: manifest + íconos.
- Landing page profesional.

---

## Reglas del agente

1. **Un bloque a la vez.** No avanzar hasta cerrar el anterior.
2. **Antes de cada feature:** leer su spec en `specs/`, listar supuestos, preguntar lo ambiguo. Esperar OK antes de codificar.
3. **Server Actions:** siempre `{ success, data }` / `{ success, error }`. Nunca excepciones al cliente.
4. **Sin `any`. Sin `console.log` de debug.**
5. **Clerk maneja auth.** No usar Supabase Auth para nada. `getCurrentUser()` usa `auth()` de Clerk.
6. **RLS con Clerk:** usar `requesting_user_id()` en las políticas, no `auth.uid()`.
7. **`tenant_id`** en cada tabla. El agente nunca omite este campo.
8. **DIFERIDO = no tocar:** pagos, registro self-service, recuperación de contraseña (Clerk lo maneja nativo).
9. **Diseño:** para CUALQUIER UI, usar la skill `ui-ux-pro-max` ANTES de implementar (ver `04-DESIGN.md`). Consultar paleta/tipografía/tokens con la skill y pasar cada pantalla por su auditoría de accesibilidad antes de cerrarla. Todo mobile-first desde 375px.
10. Cuando necesite que Christian ejecute algo (db:push, SQL, seed) → pausar y decirle exactamente qué correr.

---

## Cómo conectar Clerk + Supabase (RLS)

**Estado: hecho y verificado (Bloque 1).** El método es la integración nativa Clerk ↔
Supabase (Third-Party Auth), no un JWT Template (deprecado). Setup completo en
`specs/auth.spec.md` § "Cliente Supabase autenticado con Clerk".

```sql
-- Ya aplicado contra el proyecto Supabase vía MCP. Ver supabase/sql/0001_rls_policies.sql.
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
```

Las políticas RLS usan `requesting_tenant_id()`/`requesting_rol()` para aislar por tenant.
El `tenant_id`/`rol` del usuario vienen de `publicMetadata` en Clerk, expuesto al JWT de
sesión vía "Customize session token" (no un JWT Template).

---

## Prompt para pegarle al agente

```
Vas a construir EventRank desde cero. Tienes el paquete SDD en esta carpeta.

Lee en este orden:
1. 00-CONSTITUTION.md
2. 01-DATA-MODEL.md  
3. 02-BUSINESS-RULES.md
4. 04-DESIGN.md
5. START.md (este archivo)

Stack: Next.js 15 + Clerk (app_3FkM9JG1BXuiMoI1yeoqJOgsogL) + Supabase + Drizzle + shadcn/ui + Tailwind.

Clerk tiene su doc de setup para agentes adjunta en el contexto. Úsala para el Bloque 0.

Reglas:
- Un bloque a la vez según este START.md
- Antes de cada feature: leer el spec en specs/, listar supuestos, esperar OK
- Server Actions: { success, data } / { success, error } siempre
- Sin any, sin console.log de debug
- Clerk maneja auth, no Supabase Auth
- RLS con requesting_user_id() de Clerk, no auth.uid()
- Para TODA UI: usa la skill ui-ux-pro-max antes de implementar (paleta, tipografía, 
  accesibilidad). Mobile-first desde 375px. Ver 04-DESIGN.md.
- Cuando necesites que yo ejecute algo, para y dime exactamente qué

Empieza por el Bloque 0. Dime exactamente qué vas a hacer antes de ejecutar cualquier comando.
```
