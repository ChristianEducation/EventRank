# Spec: seed

> **Estado:** Activo — simplificado con Clerk.

---

## Qué hace el seed (y qué NO hace)

**SÍ hace:** crea el tenant Colegio San Luis en Supabase.
**NO hace:** crea usuarios. Los usuarios se crean en el dashboard de Clerk por Christian.

---

## Script

```typescript
// src/lib/db/seed.ts
import { db } from './index'
import { tenants } from './schema'

async function seed() {
  console.log('🌱 Seeding tenant Colegio San Luis...')

  await db.insert(tenants).values({
    nombre: 'Colegio San Luis',
    slug: 'colegio-san-luis',
    plan: 'interno',
    emailContacto: process.env.SEED_TENANT_EMAIL!,
    activo: true,
    configuracion: {
      max_grupos: null,
      max_actividades: null,
      max_escalas: null,
      max_eventos_activos: null,
      personalizacion_visual: true,
      multisede: false,
    },
  }).onConflictDoNothing()

  console.log('✅ Tenant creado. UUID:', )
  console.log('👉 Copia este UUID y agrégalo como tenant_id en publicMetadata de tus usuarios en Clerk.')
}

seed().catch(console.error).finally(() => process.exit(0))
```

```jsonc
// package.json
"db:seed": "tsx src/lib/db/seed.ts",
"db:push": "drizzle-kit push"
```

---

## Pasos que Christian hace en Clerk Dashboard

Después de correr el seed y obtener el UUID del tenant:

1. Ir a `dashboard.clerk.com` → Users → Crear usuario.
2. Para **Christian (super admin)**:
   - Email + contraseña
   - `publicMetadata`: `{ "rol": "super_admin", "tenant_id": "<UUID San Luis>" }`
3. Para **cada miembro del CEAL**:
   - Email real + contraseña temporal (ej: `EventRank2026!`)
   - `publicMetadata`: `{ "rol": "organizador", "tenant_id": "<UUID San Luis>" }`
4. Cada usuario recibirá el email de Clerk y podrá cambiar su clave.

---

## Criterios de aceptación

- [ ] `npm run db:seed` corre sin errores.
- [ ] El tenant San Luis aparece en Supabase con plan `interno` y todos los límites en `null`.
- [ ] Correr el seed dos veces no duplica el tenant.
- [ ] El script imprime el UUID del tenant para que Christian lo use en Clerk.
