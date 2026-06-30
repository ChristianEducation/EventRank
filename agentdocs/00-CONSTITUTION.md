# EventRank — Constitución del Proyecto

> Documento raíz del Spec-Driven Development. Es la **fuente de verdad de alto nivel**.
> Todo spec, plan y tarea debe ser consistente con este documento. Si algo entra en
> conflicto con la Constitución, gana la Constitución.

---

## 1. Misión

EventRank es una plataforma SaaS web (PWA) que permite a centros de estudiantes, colegios
y universidades gestionar **eventos competitivos entre grupos** (aniversarios, semanas de
carrera, olimpiadas) con **puntajes en tiempo real**, visibilidad controlada y acceso sin
fricción para los participantes.

El marcador oficial del evento: puntajes en vivo, transparentes y accesibles desde cualquier
celular. Sin instalar nada, sin hojas de cálculo.

---

## 2. Estrategia de esta iteración (MVP de validación real)

> **Esta es la decisión más importante del documento. Léela con atención.**

El objetivo inmediato **no** es vender a múltiples clientes todavía. El objetivo es:

1. Poner EventRank en producción con un único cliente real y gratuito: el **centro de
   estudiantes del Colegio San Luis**.
2. Correr un evento real completo de principio a fin (configurar → ingresar puntajes →
   portal público en vivo).
3. Validar que todo funciona en condiciones reales.
4. Recién entonces, construir el aparato comercial (registro self-service, pagos,
   onboarding de nuevos colegios) y salir a vender.

### 2.1 Qué SÍ se construye en esta iteración

- Login para organizadores (sin registro público — los usuarios se crean por seed).
- Gestión completa de eventos: grupos, escalas, actividades, horarios, bases.
- Ingreso de puntajes con modificadores y control de visibilidad.
- Portal público con ranking en tiempo real.
- Panel super admin básico (para Christian).

### 2.2 Qué se DIFIERE (documentado pero NO implementado ahora)

- **Registro self-service** de nuevos organizadores/colegios.
- **Pagos** (Flow/Khipu) y el gate de pago para activar eventos.
- **Onboarding** y gestión de planes desde la UI.
- **Recuperación de contraseña** self-service la maneja Clerk de forma nativa (no requiere
  codificación). Está disponible desde el inicio sin trabajo extra.

Estas features tienen su spec escrito (marcado como `DIFERIDO`) para que el modelo de datos
y la arquitectura las soporten desde el día 1, pero **no se codifican** en esta iteración.

### 2.3 Decisión sobre multi-tenancy

El principio "multi-tenant por diseño" del Plan de Desarrollo **se mantiene a nivel de
esquema**: la columna `tenant_id` existe en todas las tablas y RLS está habilitado. Esto es
innegociable — agregarlo después obligaría a reescribir todo.

Lo que se simplifica es la **operación**, no el esquema:

- No hay flujo de creación de tenants desde la UI. El tenant se crea por **seed**.
- El **seed** crea únicamente el tenant `Colegio San Luis` (plan `interno`, sin límites) en Supabase.
- Los **usuarios** (Christian como `super_admin` y los miembros del CEAL como `organizador`)
  los crea Christian en el **dashboard de Clerk**, asignando `tenant_id` y `rol` en
  `publicMetadata`. No se crean por seed (ver spec `seed` y `auth`).
- Un evento puede activarse **sin pasar por pago** en esta iteración (ver spec de `eventos`
  y `admin`). El estado `activo` se puede setear por el super admin o el organizador del tenant `interno`.

Resultado: el centro de estudiantes usa **todo gratis**, se valida end-to-end, y cuando
quieras vender solo "enciendes" el flujo de registro + pagos que ya está diseñado.

---

## 3. Stack tecnológico

| Capa            | Tecnología                                          |
|-----------------|-----------------------------------------------------|
| Framework       | Next.js 15 (App Router)                             |
| Lenguaje        | TypeScript en strict mode (sin `any`)              |
| Base de datos   | Supabase (PostgreSQL + Realtime + Storage)         |
| Autenticación   | **Clerk** (app `app_3FkM9JG1BXuiMoI1yeoqJOgsogL`)  |
| ORM             | Drizzle ORM                                        |
| Estilos         | Tailwind CSS + shadcn/ui                            |
| Validación      | Zod                                                |
| Formularios     | React Hook Form                                    |
| Deploy          | Vercel                                             |
| Pagos (diferido)| Flow o Khipu (Chile)                               |
| Emails          | Resend                                             |
| Tipo de app     | PWA                                                |

---

## 4. Principios de arquitectura (innegociables)

1. **Feature-first**: el código se organiza por funcionalidad de negocio, no por tipo de
   archivo. Todo lo de "eventos" vive junto: tipos, queries, componentes, acciones.
2. **Multi-tenant por diseño**: `tenant_id` en cada tabla, RLS habilitado. (Operación
   simplificada en esta iteración — ver §2.3, pero el esquema se mantiene completo.)
3. **Server-first**: la lógica de negocio y validaciones viven en Server Actions, no en el
   cliente. El cliente solo renderiza y dispara acciones.
4. **Un solo origen de verdad**: los tipos TypeScript se derivan del schema de Drizzle. No
   hay tipos duplicados ni `any`.
5. **Validación en capas**: Zod en el formulario, Zod en el Server Action, constraints en
   PostgreSQL. Tres capas, cero datos corruptos.
6. **Componentes pequeños**: si un componente supera 150 líneas, se divide.
7. **Errores explícitos**: las Server Actions retornan `{ success, data }` o
   `{ success, error }`. Nunca lanzan excepciones al cliente.

---

## 5. Contrato de Server Actions

Todas las Server Actions retornan el mismo shape. **Nunca** lanzan excepciones al cliente.

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

> Este es el único shape permitido. Toda Server Action lo usa, sin excepción. No se usa
> `{ data, error }` ni se lanzan excepciones al cliente.

---

## 6. Convenciones de código

| Elemento                | Convención              | Ejemplo                               |
|-------------------------|-------------------------|---------------------------------------|
| Componentes             | PascalCase              | `EventoCard.tsx`, `RankingTiempoReal.tsx` |
| Archivos de lógica      | camelCase               | `actions.ts`, `queries.ts`            |
| Carpetas de features    | lowercase               | `eventos/`, `puntajes/`               |
| Variables y funciones   | camelCase               | `getTenantId()`, `eventoActivo`       |
| Tipos e interfaces      | PascalCase              | `Evento`, `PuntajeConGrupo`           |
| Constantes              | UPPER_SNAKE_CASE        | `MAX_GRUPOS_BASICO`, `PLAN_PRO`       |
| Server Actions          | verbo + sustantivo      | `crearEvento()`, `editarPuntaje()`    |
| Queries                 | get + sustantivo        | `getEventoById()`, `getGruposByEvento()` |

- Sin `console.log` de debug en el código final.
- Sin `any`. Si un tipo es desconocido, se modela con `unknown` + validación Zod.

---

## 7. Anatomía de una feature

Cada carpeta dentro de `src/features/` sigue la misma estructura:

```
features/[nombre]/
  actions.ts      # Server Actions ('use server'). Escritura: crear, editar, eliminar.
  queries.ts      # Funciones de lectura (SELECT). Server Components y Server Actions.
  schemas.ts      # Esquemas Zod. Compartidos entre cliente (form) y server (action).
  types.ts        # Tipos derivados del schema de Drizzle. Sin duplicar.
  components/      # Componentes React específicos de esta feature.
```

---

## 8. Flujo SDD para el agente

Para cada feature, el orden de trabajo es:

```
SPEC  ──→  PLAN  ──→  TASKS  ──→  IMPLEMENTACIÓN  ──→  VERIFICACIÓN
   │          │          │              │                  │
 (este     (deriva   (descompone   (un task a la       (criterios de
  doc)      del spec)  en tareas)    vez, con tests)     aceptación)
```

Reglas:
- **Un task a la vez.** No pedir dos features en el mismo prompt.
- **No avanzar de fase** hasta que la anterior cumpla su criterio de aceptación.
- **Antes de codificar**, el agente lista los supuestos que está haciendo. Si algo del
  spec es ambiguo, pregunta antes de escribir código.
- Cada feature referencia su spec en `specs/[nombre]/spec.md`.

---

## 9. Glosario

| Término          | Definición                                                            |
|------------------|-----------------------------------------------------------------------|
| Tenant           | El colegio o universidad. Dueño de sus datos. (Hoy: solo San Luis.)  |
| Organizador      | Usuario con cuenta que configura y gestiona el evento.               |
| Participante     | Cualquiera con el link o PIN. Sin cuenta. Solo lectura.              |
| Super Admin      | Christian. Acceso a todos los tenants y al panel `/admin`.           |
| Evento           | La competencia. Tiene grupos, escalas, actividades, puntajes.        |
| Grupo            | Equipo/alianza que compite (ej: "Alianza Azul").                     |
| Escala           | Tabla de puntaje por lugar (1° = 100 pts, 2° = 80 pts...).           |
| Actividad        | Competencia individual dentro del evento. Usa una escala.            |
| Resultado/Puntaje| El puntaje obtenido por un grupo en una actividad.                   |
| Modificador      | Comodín (x2), bonificación (+) o sanción (−) sobre un puntaje.       |
| Visibilidad      | público / privado. El ranking solo suma públicos.                   |
