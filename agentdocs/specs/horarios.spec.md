# Spec: horarios

> **Estado:** Activo. Independiente de bases (se pueden hacer en cualquier orden).

---

## Propósito

Gestionar la agenda del evento: ítems con nombre, fecha, hora, lugar y jornada. Visible en
el portal público ordenado por fecha y hora.

---

## Server Actions

```typescript
crearHorario(input: CrearHorarioInput): Promise<ActionResult<Horario>>
editarHorario(horarioId: string, input: EditarHorarioInput): Promise<ActionResult<Horario>>
eliminarHorario(horarioId: string): Promise<ActionResult<null>>
```

---

## Queries

```typescript
getHorariosByEvento(eventoId: string): Promise<Horario[]>   // ordenados por fecha, hora_inicio
```

---

## Schemas (Zod)

```typescript
const horarioSchema = z.object({
  nombre_actividad: z.string().min(1).max(120),
  fecha: z.coerce.date(),
  hora_inicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),   // HH:MM
  hora_fin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  lugar: z.string().max(120).optional(),
  jornada: z.enum(["mañana", "tarde", "noche"]).optional(),
}).refine(d => !d.hora_fin || d.hora_fin > d.hora_inicio, {
  message: "La hora de fin debe ser posterior a la de inicio",
  path: ["hora_fin"],
})
```

---

## Componentes

- `HorarioForm.tsx` — crear/editar ítem de agenda.
- `HorarioList.tsx` — vista de agenda agrupada por fecha.

---

## Criterios de aceptación

- [ ] Crear, editar y eliminar ítems de agenda.
- [ ] La lista se ordena por fecha y hora.
- [ ] `hora_fin > hora_inicio` cuando se define.
- [ ] Visible en el portal público.

---

## Casos borde

- Hora fin sin hora inicio → no aplica (inicio es obligatorio).
- Fechas fuera del rango del evento → permitido (el organizador manda); o avisar suavemente.
