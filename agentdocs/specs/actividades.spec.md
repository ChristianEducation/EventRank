# Spec: actividades

> **Estado:** Activo. Incluye carga masiva por archivo.

---

## Propósito

Gestionar las actividades del evento (las competencias individuales). Cada actividad tiene
una escala asignada (obligatoria, RN-07). Soporta creación individual y carga masiva.

---

## Server Actions

```typescript
crearActividad(input: CrearActividadInput): Promise<ActionResult<Actividad>>
editarActividad(actividadId: string, input: EditarActividadInput): Promise<ActionResult<Actividad>>
eliminarActividad(actividadId: string): Promise<ActionResult<null>>
procesarCargaMasiva(input: { eventoId: string; filas: FilaActividad[] }): Promise<ActionResult<{ creadas: number; errores: ErrorFila[] }>>
```

### `crearActividad`
- `escala_id` obligatoria (RN-07). Si falta → error de validación.
- Valida límite de plan al activar (RN-05); `interno` = sin límite.

### `procesarCargaMasiva`
- Recibe filas ya parseadas del archivo (el parseo ocurre en el cliente o en una action
  previa). Columnas: `nombre | descripcion | reglas | nombre_escala`.
- Valida **fila por fila**. Resuelve `nombre_escala` → `escala_id` (debe existir en el evento).
- Crea **todas las válidas en una transacción**. Devuelve conteo de creadas + lista de errores
  por fila (número de fila + motivo).
- Si una fila referencia una escala inexistente → error en esa fila, no aborta las demás.

> **Formato:** CSV en MVP (más simple, sin dependencia pesada). Documentar la plantilla
> descargable con las columnas `nombre | descripcion | reglas | nombre_escala`. Migrar a
> `.xlsx` con la librería `xlsx` es un nice-to-have posterior.

---

## Queries

```typescript
getActividadesByEvento(eventoId: string): Promise<Actividad[]>
getActividadById(actividadId: string): Promise<Actividad | null>
```

---

## Schemas (Zod)

```typescript
const actividadSchema = z.object({
  nombre: z.string().min(1).max(120),
  descripcion: z.string().max(2000).optional(),
  reglas: z.string().max(2000).optional(),
  escalaId: z.string().uuid("Debe asignar una escala"),   // RN-07
})

const filaActividadSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  reglas: z.string().optional(),
  nombre_escala: z.string().min(1),
})
```

---

## Componentes

- `ActividadForm.tsx` — formulario individual (incluye selector de escala).
- `ActividadList.tsx` — lista de actividades.
- `ExcelUpload.tsx` (o `CargaMasiva.tsx`) — sube archivo, parsea, muestra preview y errores
  por fila antes de confirmar.

---

## Criterios de aceptación

- [ ] No se guarda una actividad sin escala (RN-07).
- [ ] Carga masiva crea todas las filas válidas y reporta las inválidas con su número de fila.
- [ ] Una fila con escala inexistente no rompe el resto del lote.
- [ ] Hay una plantilla descargable con las 4 columnas.
- [ ] Con plan `interno`, sin límite de actividades.

---

## Casos borde

- Archivo vacío → mensaje claro.
- Columnas mal nombradas → error global explicando el formato esperado.
- Duplicados dentro del mismo archivo → permitidos (el organizador decide); o avisar. Decisión:
  permitir, son actividades distintas si el organizador quiere.
