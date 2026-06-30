# EventRank — Modelo de Datos

> Fuente de verdad del esquema de base de datos. Todos los specs de features referencian
> este documento. El schema de Drizzle en `src/lib/db/schema.ts` debe coincidir con esto.

---

## Convenciones del esquema

- Toda tabla tiene `id` (UUID, PK) y `created_at` (TIMESTAMPTZ).
- Toda tabla de negocio tiene `tenant_id` (UUID, FK → tenants). RLS habilitado.
- Nombres de columna en `snake_case` en la BD; Drizzle mapea a `camelCase` en TS.
- Borrado: se prefiere borrado lógico (`activo = false`) cuando hay dependencias.

---

## Diagrama de relaciones (resumen)

```
tenants (1) ──< (N) eventos
eventos (1) ──< (N) grupos
eventos (1) ──< (N) escalas_puntaje
eventos (1) ──< (N) actividades ──> (1) escalas_puntaje
eventos (1) ──< (N) puntajes ──> (1) actividades, (1) grupos
eventos (1) ──< (N) horarios
eventos (1) ──< (N) reglas_generales
eventos (1) ──< (N) pagos        [tabla diferida en uso, existe en esquema]
```

---

## Tabla: `tenants`

El colegio o universidad. En esta iteración solo existe uno (Colegio San Luis, vía seed).

| Campo            | Tipo        | Restricción      | Descripción                                  |
|------------------|-------------|------------------|----------------------------------------------|
| id               | UUID        | PRIMARY KEY      | Identificador único                          |
| nombre           | TEXT        | NOT NULL         | Nombre del colegio o universidad             |
| slug             | TEXT        | UNIQUE           | Identificador URL-friendly                   |
| plan             | TEXT        | NOT NULL         | `basico` \| `pro` \| `federacion` \| `interno` |
| configuracion    | JSONB       | NOT NULL         | Feature flags del plan (límites)             |
| email_contacto   | TEXT        | NOT NULL         | Email del organizador principal              |
| activo           | BOOLEAN      | DEFAULT true     | Si el tenant está activo                     |
| created_at       | TIMESTAMPTZ | NOT NULL         | Fecha de registro                            |

**Nota MVP:** se agrega el valor de plan `interno` para el tenant gratuito de validación
(Colegio San Luis), con todos los límites en `null` (sin límite).

### Shape de `configuracion` (feature flags)

```jsonc
{
  "max_grupos": null,            // null = sin límite
  "max_actividades": null,
  "max_escalas": null,
  "max_eventos_activos": 1,      // Federación/interno: null
  "personalizacion_visual": true,
  "multisede": false
}
```

| Plan       | max_grupos | max_actividades | max_escalas | eventos_activos | personalización | multisede |
|------------|-----------|-----------------|-------------|-----------------|-----------------|-----------|
| basico     | 4         | 20              | 1           | 1               | solo imagen     | false     |
| pro        | null      | null            | null        | 1               | imagen + color  | false     |
| federacion | null      | null            | null        | null            | imagen + color  | true      |
| **interno**| null      | null            | null        | null            | imagen + color  | false     |

---

## Tabla: `eventos`

| Campo            | Tipo        | Restricción      | Descripción                                  |
|------------------|-------------|------------------|----------------------------------------------|
| id               | UUID        | PRIMARY KEY      | Identificador único                          |
| tenant_id        | UUID        | FK tenants       | Tenant dueño del evento                      |
| nombre           | TEXT        | NOT NULL         | Nombre del evento                            |
| slug             | TEXT        | UNIQUE           | Identificador para la URL pública (global)   |
| estado           | TEXT        | NOT NULL         | `borrador` \| `activo` \| `finalizado`       |
| tipo_acceso      | TEXT        | NOT NULL         | `publico` \| `pin`                           |
| pin              | TEXT        | NULLABLE         | PIN de acceso hasheado (si tipo_acceso=pin)  |
| imagen_url       | TEXT        | NULLABLE         | URL de la imagen del evento                  |
| colores          | JSONB       | NULLABLE         | Arreglo de hasta 3 colores hex (solo plan Pro+). Ej: `["#000000", "#FBBF24"]` |
| fecha_inicio     | DATE        | NULLABLE         | Fecha de inicio                              |
| fecha_fin        | DATE        | NULLABLE         | Fecha de término                             |
| created_at       | TIMESTAMPTZ | NOT NULL         | Fecha de creación                            |

> **Nota (Bloque 3):** `color_principal` (un solo hex) se reemplazó por `colores` (arreglo
> JSONB, hasta 3) para permitir combinar colores de marca (ej. un colegio con negro y
> amarillo). El portal público (Bloque 4) los usa para el branding del header del evento.

**Reglas de estado** (ver spec de `eventos`):
- `borrador`: configuración completa sin costo, no accesible al público.
- `activo`: portal público accesible, se pueden ingresar puntajes.
- `finalizado`: solo lectura.

**Nota MVP:** en producción `borrador → activo` requiere pago confirmado. En esta iteración,
el super admin (o el seed) puede activar un evento directamente sin pago. Ver spec `eventos` §
"Activación".

---

## Tabla: `grupos`

| Campo       | Tipo        | Restricción  | Descripción                       |
|-------------|-------------|--------------|-----------------------------------|
| id          | UUID        | PRIMARY KEY  | Identificador único               |
| tenant_id   | UUID        | FK tenants   | Tenant dueño                      |
| evento_id   | UUID        | FK eventos   | Evento al que pertenece           |
| nombre      | TEXT        | NOT NULL     | Nombre del grupo o alianza        |
| color       | TEXT        | NULLABLE     | Color hex del grupo               |
| orden       | INTEGER     | DEFAULT 0    | Orden de aparición en el portal   |
| activo      | BOOLEAN     | DEFAULT true | Soporta RN-06 (desactivar/ocultar en vez de eliminar) |
| created_at  | TIMESTAMPTZ | NOT NULL     | Fecha de creación                 |

> **Nota (Bloque 1):** columna `activo` agregada para cumplir RN-06 ("no se puede eliminar
> un grupo con puntajes; solo desactivar/ocultar"). No estaba en la versión original de este
> documento. Las queries del portal público y del dashboard filtran `WHERE activo = true` por
> defecto.

---

## Tabla: `escalas_puntaje`

| Campo       | Tipo        | Restricción  | Descripción                              |
|-------------|-------------|--------------|------------------------------------------|
| id          | UUID        | PRIMARY KEY  | Identificador único                      |
| tenant_id   | UUID        | FK tenants   | Tenant dueño                             |
| evento_id   | UUID        | FK eventos   | Evento al que pertenece                  |
| nombre      | TEXT        | NOT NULL     | Nombre de la escala (ej: "Escala Z")     |
| puntajes    | JSONB       | NOT NULL     | Mapa lugar → puntaje                      |
| created_at  | TIMESTAMPTZ | NOT NULL     | Fecha de creación                        |

### Shape de `puntajes` (JSONB)

```jsonc
{ "1": 100, "2": 80, "3": 60, "4": 40, "5": 20, "6": 10 }
```

> **Formato definitivo:** objeto `{ "1": 100, "2": 80 }` (clave = lugar como string, valor =
> puntaje). Debe ser consistente en TODAS las features que lo consumen: `escalas`,
> `actividades`, `puntajes`. No usar array tipado.

---

## Tabla: `actividades`

| Campo        | Tipo        | Restricción  | Descripción                          |
|--------------|-------------|--------------|--------------------------------------|
| id           | UUID        | PRIMARY KEY  | Identificador único                  |
| tenant_id    | UUID        | FK tenants   | Tenant dueño                         |
| evento_id    | UUID        | FK eventos   | Evento al que pertenece              |
| escala_id    | UUID        | FK escalas   | Escala de puntaje asignada (obligatoria) |
| nombre       | TEXT        | NOT NULL     | Nombre de la actividad               |
| descripcion  | TEXT        | NULLABLE     | Descripción                          |
| reglas       | TEXT        | NULLABLE     | Reglas específicas                   |
| orden        | INTEGER     | DEFAULT 0    | Orden de aparición                   |
| created_at   | TIMESTAMPTZ | NOT NULL     | Fecha de creación                    |

**Regla:** no se puede guardar una actividad sin `escala_id` (RN-07).

---

## Tabla: `puntajes`

El resultado de un grupo en una actividad.

| Campo           | Tipo        | Restricción  | Descripción                            |
|-----------------|-------------|--------------|----------------------------------------|
| id              | UUID        | PRIMARY KEY  | Identificador único                    |
| tenant_id       | UUID        | FK tenants   | Tenant dueño                           |
| evento_id       | UUID        | FK eventos   | Evento al que pertenece                |
| actividad_id    | UUID        | FK actividades | Actividad correspondiente            |
| grupo_id        | UUID        | FK grupos    | Grupo que obtuvo el resultado          |
| lugar           | INTEGER     | NOT NULL     | Lugar obtenido (1, 2, 3...)            |
| puntaje_base    | INTEGER     | NOT NULL     | Puntaje según escala y lugar           |
| comodin         | BOOLEAN     | DEFAULT false| Si se aplicó comodín (x2)              |
| bonificacion    | INTEGER     | DEFAULT 0    | Puntos adicionales                     |
| sancion         | INTEGER     | DEFAULT 0    | Puntos descontados                     |
| puntaje_final   | INTEGER     | NOT NULL     | Total con modificadores                |
| publico         | BOOLEAN     | DEFAULT false| Si es visible en el portal público     |
| created_at      | TIMESTAMPTZ | NOT NULL     | Fecha de ingreso                       |
| updated_at      | TIMESTAMPTZ | NOT NULL     | Última modificación                    |

**Fórmula** (RN-09): `puntaje_final = (puntaje_base * (comodin ? 2 : 1)) + bonificacion - sancion`

> **Diseño definitivo:** columnas separadas (`comodin` bool, `bonificacion` int, `sancion`
> int) + `publico` (bool). Esto permite aplicar comodín Y bonificación a la vez, como asume
> RN-09. La tabla se llama `puntajes` (no `resultados`).

---

## Tabla: `horarios`

| Campo             | Tipo        | Restricción  | Descripción                       |
|-------------------|-------------|--------------|-----------------------------------|
| id                | UUID        | PRIMARY KEY  | Identificador único               |
| tenant_id         | UUID        | FK tenants   | Tenant dueño                      |
| evento_id         | UUID        | FK eventos   | Evento al que pertenece           |
| nombre_actividad  | TEXT        | NOT NULL     | Nombre del ítem de agenda         |
| fecha             | DATE        | NOT NULL     | Fecha del ítem                    |
| hora_inicio       | TIME        | NOT NULL     | Hora de inicio                    |
| hora_fin          | TIME        | NULLABLE     | Hora de término                   |
| lugar             | TEXT        | NULLABLE     | Lugar físico                      |
| jornada           | TEXT        | NULLABLE     | `mañana` \| `tarde` \| `noche`    |
| created_at        | TIMESTAMPTZ | NOT NULL     | Fecha de creación                 |

---

## Tabla: `reglas_generales`

| Campo       | Tipo        | Restricción  | Descripción                       |
|-------------|-------------|--------------|-----------------------------------|
| id          | UUID        | PRIMARY KEY  | Identificador único               |
| tenant_id   | UUID        | FK tenants   | Tenant dueño                      |
| evento_id   | UUID        | FK eventos   | Evento al que pertenece           |
| titulo      | TEXT        | NOT NULL     | Título de la sección              |
| contenido   | TEXT        | NOT NULL     | Contenido del reglamento          |
| categoria   | TEXT        | NULLABLE     | Categoría de la regla             |
| orden       | INTEGER     | DEFAULT 0    | Orden de aparición                |
| visible     | BOOLEAN     | DEFAULT true | Si es visible en portal público   |
| created_at  | TIMESTAMPTZ | NOT NULL     | Fecha de creación                 |

---

## Tabla: `pagos` (DIFERIDA en uso — existe en esquema)

No se implementa el flujo en esta iteración, pero la tabla existe para no migrar después.

| Campo       | Tipo        | Restricción  | Descripción                       |
|-------------|-------------|--------------|-----------------------------------|
| id          | UUID        | PRIMARY KEY  | Identificador único               |
| tenant_id   | UUID        | FK tenants   | Tenant dueño                      |
| evento_id   | UUID        | FK eventos   | Evento asociado al pago           |
| plan        | TEXT        | NOT NULL     | Plan adquirido                    |
| monto       | INTEGER     | NOT NULL     | Monto en CLP                      |
| estado      | TEXT        | NOT NULL     | `pendiente` \| `pagado` \| `rechazado` |
| proveedor   | TEXT        | NOT NULL     | `flow` \| `khipu`                 |
| referencia  | TEXT        | NULLABLE     | ID de transacción del proveedor   |
| created_at  | TIMESTAMPTZ | NOT NULL     | Fecha de creación                 |

---

## Relación usuario ↔ tenant

**Clerk maneja los usuarios** (no Supabase Auth). La vinculación usuario → tenant + rol se
resuelve con `publicMetadata` de Clerk:

```jsonc
// publicMetadata del usuario en Clerk
{
  "tenant_id": "<uuid del Colegio San Luis>",
  "rol": "organizador"   // o "super_admin"
}
```

Christian setea estos metadata al crear cada usuario en el dashboard de Clerk (ver spec `seed`).

El identificador del usuario es el **Clerk user ID** (string, el claim `sub` del JWT), NO un
UUID de Supabase. Por eso las políticas RLS usan `requesting_user_id()` (función custom que
lee `sub` del JWT de Clerk), no `auth.uid()`.

`getCurrentUser()` lee `tenant_id` y `rol` desde `publicMetadata` vía `auth()` de Clerk
(ver spec `auth`). El middleware protege las rutas con `clerkMiddleware()`.
