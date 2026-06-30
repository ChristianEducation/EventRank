# Spec: pagos

> **Estado:** 🔴 DIFERIDO. No se implementa en esta iteración.
> Se documenta para que el modelo de datos y la arquitectura lo soporten desde ya, y para
> "encenderlo" cuando salgas a vender.

---

## Propósito (futuro)

Cobrar por evento en CLP vía Flow o Khipu. El pago confirmado activa el evento (RN-04).

---

## Por qué está diferido

En el MVP de validación, el centro de estudiantes usa todo gratis (tenant `interno`, activación
sin pago — ver Constitución §2 y spec `eventos`). Construir pagos ahora no aporta a la
validación y agrega superficie de error.

---

## Diseño previsto (para cuando se active)

### Server Actions
```typescript
generarOrdenPago(input: { eventoId: string; plan: Plan }): Promise<ActionResult<{ urlPago: string }>>
```
1. Crea registro en `pagos` con `estado = 'pendiente'`.
2. Llama a Flow/Khipu para generar la orden y obtener la URL de pago.
3. Devuelve la URL para redirigir al organizador.

### Webhook
- Ruta `POST /api/webhooks/pagos` (a crear cuando se active la feature).
- Verifica la firma del proveedor.
- Actualiza el pago a `pagado`.
- Activa el evento (`borrador → activo`), respetando RN-03 (límite de eventos activos por plan).

### Reactivación del gate
Cuando se active esta feature, en `eventos.activarEvento` se debe **quitar** el atajo del MVP
(`tenant.plan === 'interno' || rol === 'super_admin'`) y exigir pago confirmado para tenants
de pago. El tenant `interno` puede seguir activando gratis (es el cliente de validación).

---

## Criterios de aceptación (futuros, no aplican ahora)

- [ ] Generar orden crea registro `pendiente` y devuelve URL válida.
- [ ] El webhook verifica firma y rechaza llamadas no firmadas.
- [ ] Pago confirmado activa el evento automáticamente.
- [ ] Se respeta el límite de eventos activos por plan (RN-03).
