# Spec: bases (reglamento)

> **Estado:** Activo. Tabla `reglas_generales`.

---

## Propósito

Gestionar las secciones de reglamento del evento: título, contenido, categoría, orden y
visibilidad. En el portal público solo se muestran las secciones marcadas como visibles.

---

## Server Actions

```typescript
crearBase(input: CrearBaseInput): Promise<ActionResult<Base>>
editarBase(baseId: string, input: EditarBaseInput): Promise<ActionResult<Base>>
eliminarBase(baseId: string): Promise<ActionResult<null>>
toggleVisibleBase(baseId: string): Promise<ActionResult<Base>>
```

---

## Queries

```typescript
getBasesByEvento(eventoId: string): Promise<Base[]>          // todas, ordenadas (dashboard)
getBasesVisiblesByEvento(eventoId: string): Promise<Base[]>  // solo visibles (portal)
```

---

## Schemas (Zod)

```typescript
const baseSchema = z.object({
  titulo: z.string().min(1).max(160),
  contenido: z.string().min(1),
  categoria: z.string().max(60).optional(),
  orden: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
})
```

---

## Componentes

- `BaseForm.tsx` — título, contenido (textarea), categoría, orden, toggle visible.
- `BaseList.tsx` — lista ordenada, con control de visibilidad y reordenamiento.

---

## Criterios de aceptación

- [ ] CRUD completo de secciones.
- [ ] Control de orden y visibilidad por sección.
- [ ] El portal muestra solo las secciones `visible = true`.

---

## Casos borde

- Contenido vacío → rechazado.
- Todas ocultas → el portal muestra una sección de bases vacía (o la oculta del menú).
