import { and, eq } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

import { db } from "@/lib/db";
import { eventos } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import type { Evento } from "./types";

export async function getEventosByTenant(): Promise<Evento[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  return db.select().from(eventos).where(eq(eventos.tenantId, user.tenantId));
}

export async function getEventoById(eventoId: string): Promise<Evento | null> {
  if (!UUID_RE.test(eventoId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const condition =
    user.rol === "super_admin"
      ? eq(eventos.id, eventoId)
      : and(eq(eventos.id, eventoId), eq(eventos.tenantId, user.tenantId));

  const [evento] = await db.select().from(eventos).where(condition);

  return evento ?? null;
}

export async function getEventoBySlug(slug: string): Promise<Evento | null> {
  const [evento] = await db.select().from(eventos).where(eq(eventos.slug, slug));
  return evento ?? null;
}
