# Spec: admin (super admin)

> **Estado:** Activo (versión básica). Solo accesible con rol `super_admin`.

---

## Propósito

Dar a Christian (super admin) una vista de todos los tenants y eventos para soporte y
operación. En MVP es deliberadamente simple.

---

## Acceso

- Ruta `/admin`, protegida por middleware: solo rol `super_admin` (ver spec `auth`).
- Cualquier otro rol → redirige a `/dashboard`.

---

## Funcionalidad MVP

- Lista de tenants (en esta iteración: solo Colegio San Luis) con su plan y estado.
- Lista de eventos por tenant con su estado.
- Acción: **activar un evento sin pago** (atajo de operación para el MVP). Ver spec `eventos`.

---

## Queries

```typescript
getAllTenants(): Promise<Tenant[]>                   // solo super_admin
getEventosByTenantId(tenantId: string): Promise<Evento[]>   // solo super_admin
```

> Estas queries **omiten** el filtro de tenant de la sesión (el super admin ve todo), pero
> verifican el rol explícitamente antes de ejecutar.

---

## Criterios de aceptación

- [ ] Solo `super_admin` accede a `/admin`.
- [ ] Se listan los tenants y sus eventos.
- [ ] El super admin puede activar un evento desde el panel sin pago.

---

## Diferido

- Gestión de planes, facturación, métricas, soporte avanzado. Todo posterior a la validación.
