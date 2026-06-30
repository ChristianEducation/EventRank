# EventRank — Reglas de Negocio

> Reglas transversales que cualquier feature debe respetar. Cada spec referencia las que
> le aplican. Numeración alineada al PRD (RN-XX).

---

| ID    | Regla | Dónde se valida |
|-------|-------|-----------------|
| RN-01 | **Visibilidad del ranking.** El ranking solo suma puntajes con `publico = true`. Los privados no se incluyen en ningún cálculo del portal público. | `puntajes.calcularRanking`, `portal.getRankingPublico` |
| RN-02 | **Edición y visibilidad.** Al editar cualquier campo de un puntaje que estaba público, el sistema cambia `publico = false` automáticamente. | `puntajes.editarPuntaje` |
| RN-03 | **Eventos activos por plan.** Básico y Pro: máximo 1 evento en estado `activo` a la vez. Federación/interno: sin límite. | `eventos.activarEvento` (DIFERIDO en MVP — ver nota) |
| RN-04 | **Activación por pago.** En producción, un evento solo pasa de `borrador` a `activo` con pago confirmado vía webhook. **MVP: el super admin activa sin pago.** | `eventos.activarEvento` |
| RN-05 | **Límites de plan en borrador.** Los límites del plan se validan al intentar **publicar/activar**, no durante la configuración en borrador. (MVP con plan `interno`: sin límites, no aplica.) | `eventos.activarEvento` |
| RN-06 | **Grupos con puntajes.** No se puede eliminar un grupo con puntajes ingresados. Solo se puede desactivar/ocultar. | `grupos.eliminarGrupo` |
| RN-07 | **Escala obligatoria.** No se puede guardar una actividad sin una escala de puntaje asignada. | `actividades.schema` + `actividades.crearActividad` |
| RN-08 | **Comodín único.** Solo se puede aplicar comodín a un grupo por actividad. | `puntajes.ingresarPuntaje` |
| RN-09 | **Puntaje final.** `puntaje_final = (puntaje_base * (comodin ? 2 : 1)) + bonificacion - sancion`. Nunca negativo (mínimo 0). | `puntajes` (función `calcularPuntajeFinal`) |
| RN-10 | **Acceso al portal.** Si el evento tiene PIN, el portal no carga hasta que el visitante ingrese el PIN correcto. | `portal` + `AccesoPin` |
| RN-11 | **Evento finalizado.** Un evento finalizado es de solo lectura. No se pueden ingresar ni editar puntajes. | Todas las actions de escritura del evento |
| RN-12 | **Slug único.** El slug del evento debe ser único globalmente para que las URLs del portal sean únicas. | `eventos.crearEvento` (constraint UNIQUE + verificación) |

---

## Reglas adicionales de la iteración MVP

| ID     | Regla |
|--------|-------|
| RN-M01 | **Sin registro público.** No existe `/registro` funcional. Los usuarios (super admin + organizador del centro de estudiantes) se crean por seed. La ruta `/registro` puede existir pero deshabilitada o redirigir a `/login`. |
| RN-M02 | **Tenant único por seed.** Solo existe el tenant `Colegio San Luis`. Todo dato creado se asocia a su `tenant_id`. |
| RN-M03 | **Activación gratuita.** Un evento del tenant `interno` se puede activar sin pago. La feature `pagos` no se ejecuta en esta iteración. |
| RN-M04 | **Aislamiento de datos igual se respeta.** Aunque haya un solo tenant, RLS y los filtros por `tenant_id` se implementan correctamente. Esto es lo que permite "encender" multi-tenant después sin reescribir. |

---

## Permisos por rol

| Acción                              | Participante | Organizador | Super Admin |
|-------------------------------------|:------------:|:-----------:|:-----------:|
| Ver portal público                  | ✅            | ✅           | ✅           |
| Login al dashboard                  | ❌            | ✅           | ✅           |
| CRUD de eventos de su tenant        | ❌            | ✅           | ✅ (todos)   |
| Ingresar/editar puntajes            | ❌            | ✅           | ✅           |
| Activar evento (MVP, sin pago)      | ❌            | ❌           | ✅           |
| Ver panel `/admin` (todos tenants)  | ❌            | ❌           | ✅           |

> En MVP, dado que el organizador del centro de estudiantes necesita lanzar su evento gratis,
> se puede permitir que **también** active su propio evento (sin pago) si el tenant es `interno`.
> **Decisión tomada:** en MVP, el organizador del tenant `interno` puede activar su propio
> evento sin pago (además del super admin). Así el CEAL lanza su evento de forma autónoma.
