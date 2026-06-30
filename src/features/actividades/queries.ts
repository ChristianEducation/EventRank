import { eq, and, asc } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

import { db } from "@/lib/db";
import { actividades, escalasPuntaje } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import type { Actividad } from "./types";
import type { Escala } from "@/features/escalas/types";

export async function getActividadesByEvento(eventoId: string): Promise<Actividad[]> {
  if (!UUID_RE.test(eventoId)) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const data = await db
    .select({
      actividad: actividades,
      escala: escalasPuntaje,
    })
    .from(actividades)
    .leftJoin(escalasPuntaje, eq(actividades.escalaId, escalasPuntaje.id))
    .where(and(eq(actividades.eventoId, eventoId), eq(actividades.tenantId, user.tenantId)))
    .orderBy(asc(actividades.createdAt));

  return data.map((row) => ({
    ...row.actividad,
    escala: row.escala ? (row.escala as Escala) : undefined,
  }));
}

export async function getActividadById(actividadId: string): Promise<Actividad | null> {
  if (!UUID_RE.test(actividadId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const [row] = await db
    .select({
      actividad: actividades,
      escala: escalasPuntaje,
    })
    .from(actividades)
    .leftJoin(escalasPuntaje, eq(actividades.escalaId, escalasPuntaje.id))
    .where(and(eq(actividades.id, actividadId), eq(actividades.tenantId, user.tenantId)));

  if (!row) return null;

  return {
    ...row.actividad,
    escala: row.escala ? (row.escala as Escala) : undefined,
  };
}
