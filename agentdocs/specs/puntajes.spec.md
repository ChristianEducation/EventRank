# Spec: puntajes

> **Estado:** Activo. Es el corazón del producto y la lógica más delicada. Léelo completo.

---

## Propósito

Permitir al organizador ingresar el resultado de cada grupo en una actividad, calcular el
puntaje automáticamente según la escala, aplicar modificadores, y controlar la visibilidad
(público/privado). Calcular el ranking sumando solo puntajes públicos.

---

## Modelo (recordatorio del data model)

Tabla `puntajes` con columnas **separadas**: `comodin` (bool), `bonificacion` (int),
`sancion` (int), `publico` (bool). Fórmula RN-09:

```
puntaje_final = (puntaje_base * (comodin ? 2 : 1)) + bonificacion - sancion
puntaje_final = max(0, puntaje_final)   // nunca negativo
```

> **Diseño:** columnas separadas `comodin`/`bonificacion`/`sancion` + `publico` (bool). Tabla
> `puntajes`. Ver data model.

---

## Server Actions

```typescript
ingresarPuntaje(input: IngresarPuntajeInput): Promise<ActionResult<Puntaje>>
editarPuntaje(puntajeId: string, input: EditarPuntajeInput): Promise<ActionResult<Puntaje>>
toggleVisibilidad(puntajeId: string): Promise<ActionResult<Puntaje>>
calcularRanking(eventoId: string): Promise<ActionResult<RankingGrupo[]>>
```

### `ingresarPuntaje`
1. Verifica que el evento esté `activo` (no `finalizado`, RN-11).
2. Resuelve la escala de la actividad → obtiene `puntaje_base` según `lugar`.
3. Aplica modificadores (RN-09). Valida comodín único por actividad (RN-08): si ya hay otro
   grupo con comodín en esa actividad, rechaza o lo quita del otro (decisión: **rechazar** con
   mensaje claro).
4. Calcula `puntaje_final` (mínimo 0).
5. Guarda con `publico` según lo elegido (default `false` = privado).
6. Es **upsert** por (`actividad_id`, `grupo_id`): si ya existe, actualiza.

### `editarPuntaje` (RN-02 — regla crítica)
- Al editar cualquier campo de un puntaje que estaba `publico = true`, el sistema fuerza
  `publico = false` automáticamente. El organizador debe volver a publicarlo conscientemente.
- Recalcula `puntaje_final`. Actualiza `updated_at`.

### `toggleVisibilidad`
- Alterna `publico` true/false. Es la acción explícita de "publicar/ocultar".

### `calcularRanking` (RN-01)
- Suma `puntaje_final` por grupo **solo de puntajes con `publico = true`**.
- Ordena descendente. Devuelve posición, grupo (nombre, color) y total.

---

## Queries

```typescript
getPuntajesByEvento(eventoId: string): Promise<PuntajeConGrupo[]>     // dashboard organizador
getPuntajesByActividad(actividadId: string): Promise<PuntajeConGrupo[]>
```

---

## Schemas (Zod)

```typescript
const ingresarPuntajeSchema = z.object({
  actividadId: z.string().uuid(),
  grupoId: z.string().uuid(),
  lugar: z.number().int().min(1),
  comodin: z.boolean().default(false),
  bonificacion: z.number().int().min(0).default(0),
  sancion: z.number().int().min(0).default(0),
  publico: z.boolean().default(false),
})
```

- `lugar` debe existir en la escala de la actividad; si no, error.

---

## Componentes

- `PuntajeForm.tsx` / `IngresoPuntaje.tsx` — selector de actividad, asignación de lugar por
  grupo, modificadores opcionales, toggle público/privado.
- `TablaResultados.tsx` — lista de puntajes ingresados con badges de estado (público/privado)
  y botón de publicar/ocultar.

---

## Criterios de aceptación

- [ ] Ingresar un puntaje calcula `puntaje_base` correcto desde la escala.
- [ ] La fórmula RN-09 da el `puntaje_final` correcto en todos los casos (comodín, bonif,
      sanción, combinados). Nunca negativo.
- [ ] Solo un grupo puede tener comodín por actividad (RN-08).
- [ ] Editar un puntaje público lo vuelve privado automáticamente (RN-02).
- [ ] El ranking suma solo públicos (RN-01); los privados no aparecen ni suman.
- [ ] No se pueden ingresar/editar puntajes en un evento finalizado (RN-11).

---

## Tests manuales sugeridos

1. Escala 1°=100. Grupo A lugar 1 sin modificadores → 100.
2. + comodín → 200.
3. + bonificación 10 (sin comodín) → 110.
4. + sanción 30 (base 100) → 70.
5. base 10, sanción 50 → 0 (no negativo).
6. Intentar comodín en 2 grupos de la misma actividad → el segundo rechazado.
7. Publicar el de A, dejar privado el de B → ranking solo cuenta A.
8. Editar el de A (ya público) → pasa a privado, desaparece del ranking hasta republicar.

---

## Casos borde

- Lugar fuera de la escala → error "Lugar fuera de rango de la escala".
- Actividad sin escala → no debería ocurrir (RN-07 lo previene); defender igual.
- Dos resultados para el mismo grupo+actividad → upsert (se actualiza, no se duplica).
