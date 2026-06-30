# EventRank — Roadmap de Implementación (desde cero, con Clerk)

> Reordenado para construir desde cero con el SDD. El objetivo es llegar lo antes posible a
> "el centro de estudiantes corre un evento real". El detalle operativo de cada bloque está
> en `START.md`; este documento da la visión completa y las dependencias.

---

## Punto de partida

**Cero código.** Se construye EventRank nuevo desde el SDD. No se reutiliza el scaffold previo
de OpenClaw. Auth con Clerk desde el inicio.

---

## Bloques (resumen — detalle en START.md)

### Bloque 0 — Setup
Crear proyecto Next.js 15, instalar y configurar Clerk (`clerk init --app
app_3FkM9JG1BXuiMoI1yeoqJOgsogL`), shadcn/ui, Drizzle, cliente Supabase.
**Criterio:** `npm run dev` levanta, Clerk responde, shadcn listo.

### Bloque 1 — Schema + RLS + Seed
Schema Drizzle (9 tablas, `01-DATA-MODEL.md`), `db:push`, políticas RLS con
`requesting_user_id()` de Clerk, función SQL, y seed del tenant San Luis.
**Criterio:** tablas en Supabase, RLS activo, tenant San Luis creado.

### Bloque 2 — Layout + Middleware + Roles
`clerkMiddleware()`, `getCurrentUser()` leyendo `publicMetadata` de Clerk, layout dashboard
con sidebar, layout portal, guard `/admin`.
**Criterio:** login funciona, dashboard protegido, super admin entra a `/admin`.

### Bloque 3 — Gestión del evento (orden estricto de dependencias)
Eventos → Grupos → Escalas → Actividades → Horarios → Bases.
**Criterio:** el organizador arma un evento completo desde cero.

### Bloque 4 — Puntajes + Portal + Realtime (el corazón)
Puntajes (lo más delicado, `specs/puntajes.spec.md`), portal público, Supabase Realtime,
activar evento sin pago.
**Criterio (gran hito):** crear evento → activar → link → publicar puntaje → ranking se
actualiza solo en el portal sin recargar.

### Bloque 5 — Pulido + Producción
Loading states, responsive 375px, PWA, landing, deploy a Vercel, seed en prod.
**Criterio:** EventRank en producción, el CEAL corre su evento real.

### Bloque 6 — Comercialización (DESPUÉS de validar)
Registro self-service, pagos (Flow/Khipu), límites de plan reales, landing comercial.
**Criterio:** un colegio nuevo se registra, paga y lanza sin intervención de Christian.

---

## Dependencias críticas

**Dentro del Bloque 3** (orden importa):
- Eventos primero — todo lo demás cuelga de un evento existente.
- Grupos y Escalas antes de Actividades — las actividades necesitan escala (RN-07) y los
  puntajes necesitan grupos.
- Horarios y Bases son independientes entre sí.

**Dentro del Bloque 4:**
- Puntajes antes que Portal — el portal necesita puntajes para mostrar ranking.
- Realtime después de que el ranking funcione en estático.

---

## Regla de oro

Un bloque a la vez. No avanzar sin cumplir el criterio. Cada feature referencia su spec en
`specs/`. Antes de codificar, el agente lista supuestos y pregunta lo ambiguo. Cuando necesite
que Christian ejecute algo (db:push, SQL, seed, config en Clerk dashboard), pausa y le dice
exactamente qué hacer.
