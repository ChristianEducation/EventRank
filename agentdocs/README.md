# EventRank — Paquete Spec-Driven Development

Documentación SDD completa de EventRank, lista para entregar a tu agente de codificación.
Es la **fuente de verdad** para construir el proyecto desde cero.

## Stack

Next.js 15 · **Clerk** (auth) · Supabase (PostgreSQL + Realtime) · Drizzle ORM ·
shadcn/ui + Tailwind · Vercel.

## Cómo usarlo con tu agente

1. Coloca esta carpeta en tu repo (sugerido: `agentdocs/`).
2. Dale al agente: este paquete + el documento de setup de Clerk para agentes.
3. Pégale el prompt que está al final de `START.md`.
4. El agente arranca por el Bloque 0 (setup) y avanza bloque por bloque.

## Orden de lectura

| Archivo | Qué es |
|---------|--------|
| `START.md` | **Empezar aquí.** Bloques de trabajo, setup de Clerk, prompt para el agente. |
| `00-CONSTITUTION.md` | Misión, estrategia MVP, principios, convenciones. |
| `01-DATA-MODEL.md` | Las 9 tablas, shapes JSONB, relación usuario↔tenant (Clerk). |
| `02-BUSINESS-RULES.md` | Reglas de negocio (RN-XX) y permisos por rol. |
| `04-DESIGN.md` | Dirección visual + uso obligatorio de la skill `ui-ux-pro-max`. |
| `03-ROADMAP.md` | Visión completa de bloques y dependencias. |
| `specs/*.spec.md` | Un spec detallado por feature. |

## Specs por feature

| Spec | Estado |
|------|--------|
| `specs/seed.spec.md` | ✅ Activo — crea solo el tenant; usuarios en Clerk |
| `specs/auth.spec.md` | ✅ Activo — 100% Clerk |
| `specs/eventos.spec.md` | ✅ Activo |
| `specs/grupos.spec.md` | ✅ Activo |
| `specs/escalas.spec.md` | ✅ Activo |
| `specs/actividades.spec.md` | ✅ Activo (carga masiva incluida) |
| `specs/puntajes.spec.md` | ✅ Activo — lógica más delicada |
| `specs/horarios.spec.md` | ✅ Activo |
| `specs/bases.spec.md` | ✅ Activo |
| `specs/portal-publico.spec.md` | ✅ Activo |
| `specs/admin.spec.md` | ✅ Activo (básico) |
| `specs/pagos.spec.md` | 🔴 Diferido |

---

## Decisiones ya tomadas (no son ambiguas)

1. **Auth: Clerk** desde el inicio. App `app_3FkM9JG1BXuiMoI1yeoqJOgsogL`. No se usa Supabase Auth.
2. **Usuarios:** los crea Christian en el dashboard de Clerk con `publicMetadata`
   (`tenant_id` + `rol`). No hay registro self-service ni seed de usuarios.
3. **Tenant:** uno solo (Colegio San Luis, plan `interno`), creado por seed en Supabase.
4. **Activación de evento:** sin pago en MVP. El super admin o el organizador del tenant
   `interno` pueden activar.
5. **Schema:** se sigue el PRD — tabla `puntajes` con columnas separadas
   (`comodin`/`bonificacion`/`sancion`/`publico`); `escalas.puntajes` como objeto `{ "1": 100 }`.
6. **Carga masiva:** CSV en MVP (xlsx después).
7. **Multi-tenant:** `tenant_id` + RLS en el esquema desde el día 1; operación simplificada.
8. **Pagos y registro self-service:** DIFERIDOS.

---

## Lo único que necesito de Christian para el seed

- El email de contacto del tenant (`SEED_TENANT_EMAIL`) — del CEAL.
- Las keys de Supabase y Clerk en `.env.local` (las consigues tú en los dashboards).

Todo lo demás (los usuarios) lo creas en el dashboard de Clerk una vez que el seed te dé el
UUID del tenant.
