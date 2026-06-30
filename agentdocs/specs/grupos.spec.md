# Spec: grupos

> **Estado:** Activo.

---

## Propósito

Gestionar los grupos/alianzas que compiten en un evento (ej: "Alianza Azul").

---

## Server Actions

```typescript
crearGrupo(input: { eventoId: string; nombre: string; color?: string }): Promise<ActionResult<Grupo>>
editarGrupo(grupoId: string, input: { nombre?: string; color?: string; orden?: number }): Promise<ActionResult<Grupo>>
eliminarGrupo(grupoId: string): Promise<ActionResult<null>>
desactivarGrupo(grupoId: string): Promise<ActionResult<Grupo>>
```

### `crearGrupo`
- Valida límite de plan vía `checkPlanLimit('grupos', eventoId)` **al activar** (RN-05). En
  borrador no se bloquea. Con plan `interno`, sin límite.
- Asigna `orden` incremental por defecto.

### `eliminarGrupo` (RN-06)
- Verifica si el grupo tiene puntajes ingresados.
- Si tiene → rechaza con error legible ("No se puede eliminar un grupo con puntajes; puedes
  desactivarlo"). Si no → elimina.

### `desactivarGrupo` (RN-06)
- Pone `activo = false`. No borra el registro ni sus puntajes.
- El grupo desactivado deja de aparecer en `getGruposByEvento` (dashboard) y en el portal
  público, pero sus puntajes históricos se conservan.
- Idempotente: desactivar un grupo ya desactivado no es error.

---

## Queries

```typescript
getGruposByEvento(eventoId: string): Promise<Grupo[]>   // activos, ordenados por `orden`
```

---

## Schemas (Zod)

```typescript
const grupoSchema = z.object({
  nombre: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})
```

---

## Componentes

- `GrupoForm.tsx` — crear/editar (nombre + color picker).
- `GrupoList.tsx` — lista con colores, botones de editar/eliminar.

---

## Criterios de aceptación

- [ ] Crear, editar y reordenar grupos funciona.
- [ ] Un grupo con puntajes no se puede eliminar (RN-06); el mensaje lo explica.
- [ ] Desactivar un grupo lo oculta del dashboard y del portal, pero conserva sus puntajes.
- [ ] Con plan `interno`, no hay límite de grupos.
- [ ] El color se refleja en la lista y en el portal público.

---

## Casos borde

- Eliminar grupo sin puntajes → ok.
- Color inválido → rechazado por Zod.
- Crear grupo en evento de otro tenant → rechazado.
