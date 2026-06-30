import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, eventos } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function getAllTenantsAndEventos() {
  const user = await getCurrentUser();
  if (!user || user.rol !== "super_admin") {
    return [];
  }

  // Obtenemos tenants
  const allTenants = await db
    .select()
    .from(tenants)
    .orderBy(desc(tenants.createdAt));

  // Obtenemos eventos
  const allEventos = await db
    .select()
    .from(eventos)
    .orderBy(desc(eventos.createdAt));

  // Anidamos los eventos dentro de cada tenant
  return allTenants.map((tenant) => ({
    ...tenant,
    eventos: allEventos.filter((e) => e.tenantId === tenant.id),
  }));
}
