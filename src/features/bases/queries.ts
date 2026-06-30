import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { reglasGenerales } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import type { Base } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getBasesByEvento(eventoId: string): Promise<Base[]> {
  if (!UUID_RE.test(eventoId)) return [];
  
  const user = await getCurrentUser();
  if (!user) return [];

  const data = await db
    .select()
    .from(reglasGenerales)
    .where(and(eq(reglasGenerales.eventoId, eventoId), eq(reglasGenerales.tenantId, user.tenantId)))
    .orderBy(asc(reglasGenerales.orden), asc(reglasGenerales.createdAt));

  return data;
}
