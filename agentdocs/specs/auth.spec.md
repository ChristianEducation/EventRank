# Spec: auth

> **Estado:** Activo. Auth manejada 100% por Clerk.

---

## Decisión de arquitectura

**Clerk maneja todo:** login, logout, sesión, cambio de clave, recuperación de contraseña, UI de auth.
**No hay** `actions.ts` de signIn/signOut. No hay formularios de login propios. No hay Supabase Auth.

Los usuarios del CEAL los crea Christian en el dashboard de Clerk (`dashboard.clerk.com`), con:
- Email + contraseña temporal
- `publicMetadata`: `{ "rol": "organizador", "tenant_id": "<uuid San Luis>" }`

Christian tiene:
- `publicMetadata`: `{ "rol": "super_admin", "tenant_id": "<uuid San Luis>" }`

---

## Helper principal

```typescript
// src/lib/auth.ts
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export type Rol = 'super_admin' | 'organizador'

export interface CurrentUser {
  id: string           // Clerk user ID (sub)
  tenantId: string     // UUID del tenant en Supabase
  rol: Rol
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  const metadata = sessionClaims?.publicMetadata as { rol?: Rol; tenant_id?: string } | undefined
  if (!metadata?.rol || !metadata?.tenant_id) return null

  return {
    id: userId,
    tenantId: metadata.tenant_id,
    rol: metadata.rol,
  }
}
```

---

## Middleware

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isDashboard = createRouteMatcher(['/dashboard(.*)'])
const isAdmin = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isDashboard(req) || isAdmin(req)) {
    await auth.protect()
  }

  // Guard extra: /admin solo para super_admin
  if (isAdmin(req)) {
    const { sessionClaims } = await auth()
    const rol = (sessionClaims?.publicMetadata as { rol?: string })?.rol
    if (rol !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
```

---

## Cliente Supabase autenticado con Clerk

> **Actualización (Bloque 1):** el JWT Template nombrado "supabase" está **deprecado**. El
> método vigente es la **integración nativa Clerk ↔ Supabase (Third-Party Auth)**, verificada
> end-to-end en este proyecto. `getToken()` se llama **sin** `{ template: ... }`.

Para que RLS funcione, el cliente de Supabase debe enviar el JWT de sesión de Clerk:

```typescript
// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function createSupabaseClient() {
  const { getToken } = await auth()
  const token = await getToken() // token de sesión nativo, sin template

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  )
}
```

### Setup de la integración (una vez, ya hecho para este proyecto)

1. **Clerk Dashboard** → activar la integración nativa de Supabase (sección de
   integraciones) → copiar el dominio de Clerk que muestra.
2. **Clerk Dashboard** → Sessions → Customize session token → agregar:
   ```json
   { "role": "authenticated", "publicMetadata": "{{user.public_metadata}}" }
   ```
   (`role: authenticated` lo agrega Clerk automáticamente al activar la integración; no
   eliminarlo. `publicMetadata` es lo que agrega el agente para exponer `rol`/`tenant_id` a RLS.)
3. **Supabase Dashboard** → Authentication → Sign In/Providers → Third Party Auth → Add
   provider → Clerk → pegar el dominio del paso 1.

Las políticas RLS leen `tenant_id`/`rol` vía `requesting_tenant_id()`/`requesting_rol()`
(funciones SQL en `supabase/sql/0001_rls_policies.sql`), que parsean
`publicMetadata` desde `request.jwt.claims`.

---

## Componentes UI (Clerk nativos)

En el layout del dashboard:
```tsx
import { UserButton } from '@clerk/nextjs'
// Muestra avatar + menú con logout, cambio de clave, etc.
<UserButton />
```

En la landing / página pública:
```tsx
import { SignInButton, Show } from '@clerk/nextjs'
<Show when="signed-out">
  <SignInButton />
</Show>
```

Con shadcn/ui theme:
```tsx
import { shadcn } from '@clerk/ui/themes'
<ClerkProvider appearance={{ theme: shadcn }}>
```

---

## Criterios de aceptación

- [ ] El organizador entra a `/dashboard` con sus credenciales de Clerk.
- [ ] El super admin puede acceder a `/admin`.
- [ ] Sin sesión, `/dashboard` redirige al login de Clerk.
- [ ] Con rol `organizador`, `/admin` redirige a `/dashboard`.
- [ ] `getCurrentUser()` devuelve `tenantId` y `rol` correctos desde `publicMetadata`.
- [ ] El cliente Supabase envía el JWT de Clerk → RLS funciona.
- [ ] `UserButton` muestra logout, cambio de clave nativos de Clerk.

---

## Lo que Clerk maneja sin codificar

- ✅ UI de login (hosted o componentes)
- ✅ Cambio de contraseña
- ✅ "Olvidé mi contraseña" (email de recuperación)
- ✅ Sesión persistente
- ✅ Seguridad (bcrypt, tokens, etc.)
