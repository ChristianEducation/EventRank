"use server";

import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { puntajes, actividades, escalasPuntaje, eventos } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import {
  ingresarPuntajeSchema,
  bulkPuntajesSchema,
  type IngresarPuntajeInput,
  type EditarPuntajeInput,
  type BulkPuntajesInput,
} from "./schemas";
import type { Puntaje } from "./types";
import { type ActionResult } from "@/features/escalas/actions"; 

async function getPuntajeBase(actividadId: string, lugar: number, tenantId: string): Promise<number | null> {
  const [data] = await db
    .select({ puntajesData: escalasPuntaje.puntajes })
    .from(actividades)
    .innerJoin(escalasPuntaje, eq(actividades.escalaId, escalasPuntaje.id))
    .where(and(eq(actividades.id, actividadId), eq(actividades.tenantId, tenantId)));

  if (!data || !data.puntajesData) return null;
  
  // La estructura JSONb es Record<string, number>
  const puntajeMap = data.puntajesData as Record<string, number>;
  const puntos = puntajeMap[lugar.toString()];
  
  return puntos !== undefined ? Number(puntos) : null;
}

export async function ingresarPuntaje(input: IngresarPuntajeInput): Promise<ActionResult<Puntaje>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = ingresarPuntajeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de puntaje inválidos." };
  }

  const { actividadId, grupoId, lugar, comodin, bonificacion, sancion, publico } = parsed.data;

  // 1. RN-11: Verificar que el evento no esté finalizado
  const [act] = await db
    .select({ eventoId: actividades.eventoId })
    .from(actividades)
    .where(eq(actividades.id, actividadId));
    
  if (act) {
    const [ev] = await db.select({ estado: eventos.estado }).from(eventos).where(eq(eventos.id, act.eventoId));
    if (ev && ev.estado === "finalizado") {
      return { success: false, error: "El evento ha finalizado. No se pueden modificar puntajes." };
    }
  }

  // 2. Resolver puntaje base desde la escala
  const puntajeBase = await getPuntajeBase(actividadId, lugar, user.tenantId);
  if (puntajeBase === null) {
    return { success: false, error: `El lugar ${lugar} no existe en la escala asignada a esta competencia.` };
  }

  // 3. RN-09: Calcular puntaje final
  let finalScore = (puntajeBase * (comodin ? 2 : 1)) + bonificacion - sancion;
  finalScore = Math.max(0, finalScore); // Nunca negativo

  try {
    // 4. Upsert (Insert or Update on conflict)
    // Drizzle onConflictDoUpdate requiere target (índice único) para funcionar.
    // Asumimos que tenemos un constraint UNIQUE en (actividadId, grupoId).
    const [nuevoPuntaje] = await db
      .insert(puntajes)
      .values({
        tenantId: user.tenantId,
        eventoId: act!.eventoId,
        actividadId,
        grupoId,
        lugar,
        puntajeBase,
        comodin,
        bonificacion,
        sancion,
        puntajeFinal: finalScore,
        publico,
      })
      .onConflictDoUpdate({
        target: [puntajes.actividadId, puntajes.grupoId],
        set: {
          lugar,
          puntajeBase,
          comodin,
          bonificacion,
          sancion,
          puntajeFinal: finalScore,
          publico,
          updatedAt: new Date(),
        }
      })
      .returning();

    return { success: true, data: nuevoPuntaje as Puntaje };
  } catch (error) {
    console.error("Error al ingresar puntaje:", error);
    // Si falta el constraint en la DB en un setup anterior, podríamos recibir error 23505 (duplicado), etc.
    return { success: false, error: "Ocurrió un error al guardar el resultado." };
  }
}

export async function registrarPuntajesMasivos(input: BulkPuntajesInput): Promise<ActionResult<Puntaje[]>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = bulkPuntajesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de puntajes inválidos." };
  }

  const { actividadId, resultados } = parsed.data;

  // 1. RN-11: Verificar que el evento no esté finalizado
  const [act] = await db
    .select({ eventoId: actividades.eventoId, escalaId: actividades.escalaId })
    .from(actividades)
    .where(eq(actividades.id, actividadId));
    
  if (!act) return { success: false, error: "Actividad no encontrada" };

  const [ev] = await db.select({ estado: eventos.estado }).from(eventos).where(eq(eventos.id, act.eventoId));
  if (ev && ev.estado === "finalizado") {
    return { success: false, error: "El evento ha finalizado. No se pueden modificar puntajes." };
  }

  // 2. Obtener escala
  const [escala] = await db
    .select({ puntajesData: escalasPuntaje.puntajes })
    .from(escalasPuntaje)
    .where(eq(escalasPuntaje.id, act.escalaId));
    
  if (!escala || !escala.puntajesData) return { success: false, error: "Escala no encontrada" };
  const puntajeMap = escala.puntajesData as Record<string, number>;

  const upsertData = [];

  for (const r of resultados) {
    if (r.lugar === null || r.lugar === 0) continue; // Skip no asignados

    const puntos = puntajeMap[r.lugar.toString()];
    if (puntos === undefined) {
      return { success: false, error: `El lugar ${r.lugar} no existe en la escala.` };
    }
    
    let finalScore = (Number(puntos) * (r.comodin ? 2 : 1)) - r.sancion;
    finalScore = Math.max(0, finalScore);

    upsertData.push({
      tenantId: user.tenantId,
      eventoId: act.eventoId,
      actividadId,
      grupoId: r.grupoId,
      lugar: r.lugar,
      puntajeBase: Number(puntos),
      comodin: r.comodin,
      bonificacion: 0,
      sancion: r.sancion,
      puntajeFinal: finalScore,
      publico: false, // Por defecto privado hasta que lo publiquen
    });
  }

  if (upsertData.length === 0) {
    return { success: true, data: [] };
  }

  try {
    const insertados = await db
      .insert(puntajes)
      .values(upsertData)
      .onConflictDoUpdate({
        target: [puntajes.actividadId, puntajes.grupoId],
        set: {
          lugar: sql`excluded.lugar`,
          puntajeBase: sql`excluded.puntaje_base`,
          comodin: sql`excluded.comodin`,
          bonificacion: sql`excluded.bonificacion`,
          sancion: sql`excluded.sancion`,
          puntajeFinal: sql`excluded.puntaje_final`,
          publico: sql`excluded.publico`,
          updatedAt: new Date(),
        }
      })
      .returning();

    return { success: true, data: insertados as Puntaje[] };
  } catch (error) {
    console.error("Error masivo:", error);
    return { success: false, error: "Error al registrar puntajes masivos" };
  }
}

export async function editarPuntaje(puntajeId: string, input: EditarPuntajeInput): Promise<ActionResult<Puntaje>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { lugar, comodin, bonificacion, sancion } = input;

  // Obtener el puntaje actual para validar RN-11 y recuperar actividadId
  const [current] = await db
    .select()
    .from(puntajes)
    .where(and(eq(puntajes.id, puntajeId), eq(puntajes.tenantId, user.tenantId)));

  if (!current) {
    return { success: false, error: "Puntaje no encontrado." };
  }

  // RN-11: Verificar que el evento no esté finalizado
  const [act] = await db
    .select({ eventoId: actividades.eventoId })
    .from(actividades)
    .where(eq(actividades.id, current.actividadId));
    
  if (act) {
    const [ev] = await db.select({ estado: eventos.estado }).from(eventos).where(eq(eventos.id, act.eventoId));
    if (ev && ev.estado === "finalizado") {
      return { success: false, error: "El evento ha finalizado. No se pueden modificar puntajes." };
    }
  }

  // RN-02: Si estaba público, forzar privado al editar para requerir republicación manual
  const esPublico = current.publico ? false : input.publico;

  const puntajeBase = await getPuntajeBase(current.actividadId, lugar, user.tenantId);
  if (puntajeBase === null) {
    return { success: false, error: `El lugar ${lugar} no existe en la escala.` };
  }

  // RN-09
  let finalScore = (puntajeBase * (comodin ? 2 : 1)) + bonificacion - sancion;
  finalScore = Math.max(0, finalScore);

  try {
    const [actualizado] = await db
      .update(puntajes)
      .set({
        lugar,
        puntajeBase,
        comodin,
        bonificacion,
        sancion,
        puntajeFinal: finalScore,
        publico: esPublico,
        updatedAt: new Date(),
      })
      .where(and(eq(puntajes.id, puntajeId), eq(puntajes.tenantId, user.tenantId)))
      .returning();

    return { success: true, data: actualizado as Puntaje };
  } catch (error) {
    console.error("Error al editar puntaje:", error);
    return { success: false, error: "Error al actualizar el resultado." };
  }
}

export async function toggleVisibilidad(puntajeId: string, nuevoEstado: boolean): Promise<ActionResult<Puntaje>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    const [actualizado] = await db
      .update(puntajes)
      .set({
        publico: nuevoEstado,
        updatedAt: new Date(),
      })
      .where(and(eq(puntajes.id, puntajeId), eq(puntajes.tenantId, user.tenantId)))
      .returning();

    if (!actualizado) return { success: false, error: "Puntaje no encontrado." };
    
    return { success: true, data: actualizado as Puntaje };
  } catch (error) {
    console.error("Error al cambiar la visibilidad:", error);
    return { success: false, error: "No se pudo cambiar la visibilidad." };
  }
}
