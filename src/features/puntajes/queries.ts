import { eq, and, desc, sum } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

import { db } from "@/lib/db";
import { puntajes, actividades, grupos } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import type { Puntaje, RankingGrupo } from "./types";
import type { Actividad } from "@/features/actividades/types";
import type { Grupo } from "@/features/grupos/types";

export async function getPuntajesByEvento(eventoId: string): Promise<Puntaje[]> {
  if (!UUID_RE.test(eventoId)) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  // Usamos inner join porque necesitamos garantizar que la actividad pertenece al evento
  const data = await db
    .select({
      puntaje: puntajes,
      actividad: actividades,
      grupo: grupos,
    })
    .from(puntajes)
    .innerJoin(actividades, eq(puntajes.actividadId, actividades.id))
    .innerJoin(grupos, eq(puntajes.grupoId, grupos.id))
    .where(and(eq(actividades.eventoId, eventoId), eq(puntajes.tenantId, user.tenantId)))
    .orderBy(desc(puntajes.updatedAt));

  return data.map((row) => ({
    ...row.puntaje,
    actividad: row.actividad as Actividad,
    grupo: row.grupo as Grupo,
  }));
}

export async function getPuntajesByActividad(actividadId: string): Promise<Puntaje[]> {
  if (!UUID_RE.test(actividadId)) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const data = await db
    .select({
      puntaje: puntajes,
      grupo: grupos,
    })
    .from(puntajes)
    .innerJoin(grupos, eq(puntajes.grupoId, grupos.id))
    .where(and(eq(puntajes.actividadId, actividadId), eq(puntajes.tenantId, user.tenantId)))
    .orderBy(desc(puntajes.puntajeFinal));

  return data.map((row) => ({
    ...row.puntaje,
    grupo: row.grupo as Grupo,
  }));
}

export async function calcularRanking(eventoId: string): Promise<RankingGrupo[]> {
  if (!UUID_RE.test(eventoId)) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  // RN-01: Sumar puntajes finales, SOLO cuando publico = true.
  // Filtramos por evento (uniendo con actividades)
  const queryResult = await db
    .select({
      grupoId: grupos.id,
      nombre: grupos.nombre,
      color: grupos.color,
      puntosTotales: sum(puntajes.puntajeFinal).mapWith(Number),
    })
    .from(grupos)
    .leftJoin(
      puntajes, 
      and(
        eq(grupos.id, puntajes.grupoId),
        eq(puntajes.publico, true) // RN-01
      )
    )
    .leftJoin(actividades, eq(puntajes.actividadId, actividades.id))
    .where(
      and(
        eq(grupos.eventoId, eventoId),
        eq(grupos.tenantId, user.tenantId),
        eq(grupos.activo, true) // solo grupos activos
      )
    )
    .groupBy(grupos.id, grupos.nombre, grupos.color)
    .orderBy(desc(sum(puntajes.puntajeFinal)));

  let currentPos = 1;
  return queryResult.map((row, idx) => {
    // Manejo de empates básicos: si tiene los mismos puntos que el anterior, misma posición
    if (idx > 0 && row.puntosTotales !== queryResult[idx - 1].puntosTotales) {
      currentPos = idx + 1;
    }
    return {
      posicion: currentPos,
      grupoId: row.grupoId,
      nombre: row.nombre,
      color: row.color || "#cccccc",
      puntos_totales: row.puntosTotales || 0,
    };
  });
}
