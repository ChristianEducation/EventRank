# Spec: eventos

> **Estado:** Activo (núcleo del producto).

---

## Propósito

Permitir al organizador crear, configurar, activar, finalizar y duplicar eventos. El evento
es el contenedor de grupos, escalas, actividades, puntajes, horarios y bases.

---

## Actores

- Organizador (CRUD de eventos de su tenant).
- Super admin (puede activar sin pago; ver todos los tenants).

---

## Estados del evento

```
borrador ──(activar)──> activo ──(finalizar)──> finalizado
```

| Estado     | Público accesible | Ingreso de puntajes | Edición de config |
|------------|:-----------------:|:-------------------:|:-----------------:|
| borrador   | ❌                 | ❌                   | ✅                 |
| activo     | ✅                 | ✅                   | ✅ (limitada)      |
| finalizado | ✅ (solo lectura)  | ❌                   | ❌                 |

---

## Activación (decisión clave del MVP)

En producción: `borrador → activo` requiere pago confirmado (RN-04).

**En esta iteración (MVP):**
- El super admin puede activar cualquier evento directamente, sin pago.
- Si el tenant es `interno` (Colegio San Luis), el organizador **también** puede activar su
  propio evento sin pago.

```typescript
// features/eventos/actions.ts
activarEvento(eventoId: string): Promise<ActionResult<Evento>>
// MVP: salta el gate de pago si tenant.plan === 'interno' o rol === 'super_admin'.
// Documenta el punto exacto donde, en el futuro, se reactiva el gate de pago.
```

> **Decisión:** el organizador del centro de estudiantes puede activar su propio evento sin
> pago cuando el tenant es `interno`. El super admin también puede activar cualquier evento.

---

## Server Actions

```typescript
crearEvento(input: CrearEventoInput): Promise<ActionResult<Evento>>
editarEvento(eventoId: string, input: EditarEventoInput): Promise<ActionResult<Evento>>
finalizarEvento(eventoId: string): Promise<ActionResult<Evento>>
duplicarEvento(eventoId: string): Promise<ActionResult<Evento>>
activarEvento(eventoId: string): Promise<ActionResult<Evento>>
```

### `crearEvento`
1. Valida input con Zod.
2. Genera `slug` único global (a partir del nombre + sufijo si colisiona). Verifica RN-12.
3. Inserta con `tenant_id` de la sesión, `estado = 'borrador'`.
4. Si `tipo_acceso = 'pin'`, hashea el PIN antes de guardar.

### `duplicarEvento` (RN — Flujo 5)
1. Copia grupos, escalas y actividades del evento origen.
2. El nuevo evento se crea en `borrador`, con nombre `"<nombre> (copia)"` editable.
3. **No** copia puntajes, horarios ni el estado activo.
4. Genera nuevo slug único.

### `finalizarEvento` (RN-11)
- Pasa a `finalizado`. A partir de ahí, las actions de escritura de puntajes deben rechazar.

---

## Queries

```typescript
getEventosByTenant(): Promise<Evento[]>           // eventos del tenant de la sesión
getEventoById(eventoId: string): Promise<Evento | null>
getEventoBySlug(slug: string): Promise<Evento | null>  // usado por el portal
```

---

## Schemas (Zod)

```typescript
const crearEventoSchema = z.object({
  nombre: z.string().min(3).max(100),
  tipo_acceso: z.enum(["publico", "pin"]),
  pin: z.string().length(6).optional(),
  colores: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).max(3).optional(),
  imagen_url: z.string().url().optional(),
  fecha_inicio: z.coerce.date().optional(),
  fecha_fin: z.coerce.date().optional(),
}).refine(d => d.tipo_acceso !== "pin" || !!d.pin, {
  message: "El PIN es obligatorio si el acceso es por PIN",
  path: ["pin"],
})
```

- `colores` (hasta 3, para combinar colores de marca) solo se acepta si
  `tenant.configuracion.personalizacion_visual === true`.
- `fecha_fin >= fecha_inicio` cuando ambas existen.

---

## Componentes

- `EventoForm.tsx` — crear/editar.
- `EventoCard.tsx` — tarjeta en la lista.
- `EventoEstado.tsx` — badge visual del estado (borrador/activo/finalizado).

---

## Páginas

- `/dashboard/eventos` — lista de eventos del tenant.
- `/dashboard/eventos/nuevo` — formulario de creación (selector de plan oculto/forzado a
  `interno` en MVP).
- `/dashboard/eventos/[id]` — resumen + navegación a subsecciones.

---

## Criterios de aceptación

- [ ] El organizador crea un evento en `borrador`.
- [ ] El slug es único; crear dos eventos con el mismo nombre genera slugs distintos.
- [ ] El super admin (o el organizador de tenant `interno`) puede activar el evento sin pago.
- [ ] Activar el evento hace accesible el portal público.
- [ ] Duplicar copia grupos/escalas/actividades pero no puntajes, y deja el nuevo en borrador.
- [ ] Finalizar bloquea el ingreso de puntajes (RN-11).
- [ ] Un evento con PIN guarda el PIN hasheado, nunca en texto plano.

---

## Casos borde

- Activar un evento ya activo → no-op idempotente, sin error duro.
- Finalizar un evento en borrador → permitido pero sin sentido; o bloquear y pedir activar
  primero. **Decisión:** permitir solo `activo → finalizado`.
- Duplicar un evento de otro tenant → rechazar (RLS + verificación explícita).
