# Spec: portal-publico

> **Estado:** Activo. La cara visible para los participantes. Sin auth.

---

## Propósito

Mostrar a cualquier persona (sin cuenta) el ranking en tiempo real, las actividades, la
agenda y las bases de un evento activo, accediendo por link o PIN.

---

## Acceso (RN-10)

| Tipo de acceso | Comportamiento                                                  |
|----------------|-----------------------------------------------------------------|
| `publico`      | El link `/e/[slug]` carga directo, sin código.                  |
| `pin`          | El portal no carga el contenido hasta ingresar el PIN correcto. |

El PIN se compara contra el hash guardado. Una vez validado, se guarda en sesión del visitante
(cookie/localStorage del lado cliente) para no volver a pedirlo en cada navegación.

---

## Queries (sin auth, solo lectura, solo datos visibles)

```typescript
getEventoPublico(slug: string): Promise<EventoPublico | null>     // datos del evento + branding
getRankingPublico(eventoId: string): Promise<RankingGrupo[]>      // RN-01: solo públicos
getActividadesPublicas(eventoId: string): Promise<Actividad[]>
getHorariosPublicos(eventoId: string): Promise<Horario[]>
getBasesPublicas(eventoId: string): Promise<Base[]>               // solo visibles
```

> Estas queries **no** usan la sesión del organizador. Filtran por `evento.estado IN
> ('activo','finalizado')` y por visibilidad. Nunca exponen puntajes privados ni datos de
> otros tenants.

---

## Tiempo real (RN — Fase 4)

- `RankingTiempoReal.tsx` se suscribe a Supabase Realtime sobre la tabla `puntajes` filtrada
  por `evento_id`.
- Ante un cambio (insert/update/delete), recalcula y re-renderiza el ranking **sin recargar**.
- Solo refleja cambios en puntajes `publico = true` (si pasa a privado, desaparece en vivo).

---

## Páginas

- `/e/[slug]` — ranking (home del portal).
- `/e/[slug]/actividades` — lista pública de actividades.
- `/e/[slug]/horarios` — agenda pública.
- `/e/[slug]/bases` — reglamento (secciones visibles).
- Layout del portal con header del evento: nombre, imagen, color del tenant (si Pro+).

---

## Componentes

- `AccesoPin.tsx` — formulario de PIN (6 caracteres) con validación.
- `RankingTiempoReal.tsx` — tabla de ranking con suscripción Realtime.
- `PortalLayout.tsx` — header con branding + navegación.

---

## Criterios de aceptación

- [ ] Un evento `publico` carga el portal directo desde el link.
- [ ] Un evento con PIN no muestra contenido hasta ingresar el PIN correcto (RN-10).
- [ ] El ranking muestra solo puntajes públicos (RN-01).
- [ ] Al publicar un puntaje, el ranking se actualiza en vivo en el celular del participante
      sin recargar (criterio de éxito Fase 4).
- [ ] El portal nunca muestra datos de otro tenant ni puntajes privados.
- [ ] Funciona en pantallas desde 375px (móvil).

---

## Casos borde

- Slug inexistente → 404 amigable.
- Evento en `borrador` → el portal responde "evento no disponible" (no expone nada).
- PIN incorrecto → mensaje de error, sin filtrar el PIN correcto.
- Evento finalizado → portal en solo lectura, ranking congelado.
