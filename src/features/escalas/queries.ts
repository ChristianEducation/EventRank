import { and, eq } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

import { db } from "@/lib/db";
import { escalasPuntaje } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import type { Escala } from "./types";

export async function getEscalasByEvento(eventoId: string): Promise<Escala[]> {
  if (!UUID_RE.test(eventoId)) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const data = await db
    .select()
    .from(escalasPuntaje)
    .where(and(eq(escalasPuntaje.eventoId, eventoId), eq(escalasPuntaje.tenantId, user.tenantId)));

  // Drizzle retorna puntajes como unknown (o json), lo forzamos a nuestro tipo
  return data as Escala[];
}

export async function getEscalaById(escalaId: string): Promise<Escala | null> {
  if (!UUID_RE.test(escalaId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const [escala] = await db
    .select()
    .from(escalasPuntaje)
    .where(and(eq(escalasPuntaje.id, escalaId), eq(escalasPuntaje.tenantId, user.tenantId)));

  if (!escala) return null;

  return escala as Escala;
}
