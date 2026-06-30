import { auth } from "@clerk/nextjs/server";

export type Rol = "super_admin" | "organizador";

export interface CurrentUser {
  id: string;
  tenantId: string;
  rol: Rol;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const metadata = sessionClaims?.publicMetadata as
    | { rol?: Rol; tenant_id?: string }
    | undefined;
  if (!metadata?.rol || !metadata?.tenant_id) return null;

  return {
    id: userId,
    tenantId: metadata.tenant_id,
    rol: metadata.rol,
  };
}
