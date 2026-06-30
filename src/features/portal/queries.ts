import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  eventos,
  grupos,
  puntajes,
  actividades,
  horarios,
  reglasGenerales,
  tenants,
} from "@/lib/db/schema";

// 1. Obtener datos del evento público y branding
export async function getEventoPublico(slug: string) {
  const [evento] = await db
    .select({
      id: eventos.id,
      tenantId: eventos.tenantId,
      nombre: eventos.nombre,
      slug: eventos.slug,
      estado: eventos.estado,
      tipoAcceso: eventos.tipoAcceso,
      pin: eventos.pin,
      imagenUrl: eventos.imagenUrl,
      colores: eventos.colores,
      tenantNombre: tenants.nombre,
      tenantPlan: tenants.plan,
    })
    .from(eventos)
    .innerJoin(tenants, eq(eventos.tenantId, tenants.id))
    .where(eq(eventos.slug, slug));

  if (!evento) return null;
  
  // No mostrar eventos en borrador en el portal público
  if (evento.estado === "borrador") return null;

  return evento;
}

// 2. Obtener Ranking (Solo puntajes públicos)
export async function getRankingPublico(eventoId: string) {
  // Obtenemos todos los grupos activos
  const gruposList = await db
    .select({
      id: grupos.id,
      nombre: grupos.nombre,
      color: grupos.color,
    })
    .from(grupos)
    .where(and(eq(grupos.eventoId, eventoId), eq(grupos.activo, true)));

  // Obtenemos todos los puntajes públicos de este evento
  const puntajesList = await db
    .select({
      grupoId: puntajes.grupoId,
      puntajeFinal: puntajes.puntajeFinal,
    })
    .from(puntajes)
    .where(and(eq(puntajes.eventoId, eventoId), eq(puntajes.publico, true)));

  // Sumamos los puntajes por grupo
  const rankingMap = new Map<string, number>();
  gruposList.forEach(g => rankingMap.set(g.id, 0));

  puntajesList.forEach(p => {
    if (rankingMap.has(p.grupoId)) {
      rankingMap.set(p.grupoId, rankingMap.get(p.grupoId)! + p.puntajeFinal);
    }
  });

  // Armamos el array final
  const ranking = gruposList.map(g => ({
    ...g,
    puntajeTotal: rankingMap.get(g.id) || 0,
  }));

  // Ordenamos descendente
  return ranking.sort((a, b) => b.puntajeTotal - a.puntajeTotal);
}

// 3. Obtener Actividades Públicas
export async function getActividadesPublicas(eventoId: string) {
  return await db
    .select()
    .from(actividades)
    .where(eq(actividades.eventoId, eventoId))
    .orderBy(asc(actividades.orden));
}

// 4. Obtener Horarios Públicos
export async function getHorariosPublicos(eventoId: string) {
  return await db
    .select()
    .from(horarios)
    .where(eq(horarios.eventoId, eventoId))
    .orderBy(asc(horarios.fecha), asc(horarios.horaInicio));
}

// 5. Obtener Bases Visibles
export async function getBasesPublicas(eventoId: string) {
  return await db
    .select()
    .from(reglasGenerales)
    .where(and(eq(reglasGenerales.eventoId, eventoId), eq(reglasGenerales.visible, true)))
    .orderBy(asc(reglasGenerales.orden), asc(reglasGenerales.createdAt));
}
