# Spec: escalas

> **Estado:** Activo.

---

## Propósito

Definir escalas de puntaje reutilizables: una tabla de "lugar → puntos" (1° = 100, 2° = 80…).
Una escala puede usarse en múltiples actividades.

---

## Server Actions

```typescript
crearEscala(input: { eventoId: string; nombre: string; puntajes: Record<string, number> }): Promise<ActionResult<Escala>>
editarEscala(escalaId: string, input: { nombre?: string; puntajes?: Record<string, number> }): Promise<ActionResult<Escala>>
eliminarEscala(escalaId: string): Promise<ActionResult<null>>
```

- `crearEscala`: valida límite de plan **al activar** (RN-05); `interno` = sin límite.
- `eliminarEscala`: rechazar si hay actividades que la usan (similar a RN-06 para grupos).

---

## Queries

```typescript
getEscalasByEvento(eventoId: string): Promise<Escala[]>
getEscalaById(escalaId: string): Promise<Escala | null>
```

---

## Schemas (Zod)

```typescript
const escalaSchema = z.object({
  nombre: z.string().min(1).max(60),
  // mapa "1": 100, "2": 80, ... — claves numéricas como string, valores enteros >= 0
  puntajes: z.record(z.string().regex(/^\d+$/), z.number().int().min(0)),
}).refine(p => Object.keys(p.puntajes).length >= 1, {
  message: "La escala debe tener al menos un lugar definido",
})
```

> Formato de `puntajes` según el data model: objeto `{ "1": 100, "2": 80 }`. Mantener
> consistente con `actividades` y `puntajes`.

---

## Componentes

- `EscalaForm.tsx` — nombre + filas editables de "lugar → puntos".
- `EscalaList.tsx` — tabla de escalas; muestra los puntajes por lugar.

---

## Criterios de aceptación

- [ ] Crear una escala con N lugares y verla reflejada.
- [ ] Editar puntajes inline.
- [ ] No se puede eliminar una escala usada por una actividad.
- [ ] Con plan `interno`, sin límite de escalas.

---

## Casos borde

- Escala con 0 lugares → rechazada.
- Puntaje negativo → rechazado.
- Lugares no consecutivos (ej: define 1 y 3 sin 2) → permitido; el ingreso de puntaje solo
  ofrece los lugares definidos.
