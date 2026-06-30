import { and, asc, eq } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

import { db } from "@/lib/db";
import { grupos } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import type { Grupo } from "./types";

export async function getGruposByEvento(eventoId: string): Promise<Grupo[]> {
  if (!UUID_RE.test(eventoId)) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  return db
    .select()
    .from(grupos)
    .where(
      and(
        eq(grupos.eventoId, eventoId),
        eq(grupos.tenantId, user.tenantId),
        eq(grupos.activo, true),
      ),
    )
    .orderBy(asc(grupos.orden));
}
