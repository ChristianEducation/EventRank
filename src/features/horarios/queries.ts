import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { horarios } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import type { Horario } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getHorariosByEvento(eventoId: string): Promise<Horario[]> {
  if (!UUID_RE.test(eventoId)) return [];
  
  const user = await getCurrentUser();
  if (!user) return [];

  const data = await db
    .select()
    .from(horarios)
    .where(and(eq(horarios.eventoId, eventoId), eq(horarios.tenantId, user.tenantId)))
    .orderBy(asc(horarios.fecha), asc(horarios.horaInicio));

  return data;
}
