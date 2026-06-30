"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { horarios } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import {
  crearHorarioSchema,
  type CrearHorarioInput,
  type EditarHorarioInput,
} from "./schemas";
import type { Horario } from "./types";
import { type ActionResult } from "@/features/escalas/actions";

// Formatear date a string YYYY-MM-DD para guardar
function formatDateForDB(dateObj: Date): string {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function crearHorario(eventoId: string, input: CrearHorarioInput): Promise<ActionResult<Horario>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = crearHorarioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de horario inválidos." };
  }

  const { nombreActividad, fecha, horaInicio, horaFin, lugar, jornada } = parsed.data;

  try {
    const [nuevoHorario] = await db
      .insert(horarios)
      .values({
        tenantId: user.tenantId,
        eventoId,
        nombreActividad,
        fecha: formatDateForDB(fecha),
        horaInicio,
        horaFin: horaFin || null,
        lugar: lugar || null,
        jornada: (jornada as "mañana" | "tarde" | "noche") || null,
      })
      .returning();

    return { success: true, data: nuevoHorario as Horario };
  } catch (error) {
    console.error("Error al crear horario:", error);
    return { success: false, error: "Ocurrió un error al guardar la agenda." };
  }
}

export async function editarHorario(horarioId: string, input: EditarHorarioInput): Promise<ActionResult<Horario>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = crearHorarioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de horario inválidos." };
  }

  const { nombreActividad, fecha, horaInicio, horaFin, lugar, jornada } = parsed.data;

  try {
    const [actualizado] = await db
      .update(horarios)
      .set({
        nombreActividad,
        fecha: formatDateForDB(fecha),
        horaInicio,
        horaFin: horaFin || null,
        lugar: lugar || null,
        jornada: (jornada as "mañana" | "tarde" | "noche") || null,
      })
      .where(and(eq(horarios.id, horarioId), eq(horarios.tenantId, user.tenantId)))
      .returning();

    if (!actualizado) return { success: false, error: "Horario no encontrado." };
    
    return { success: true, data: actualizado as Horario };
  } catch (error) {
    console.error("Error al editar horario:", error);
    return { success: false, error: "Error al actualizar la agenda." };
  }
}

export async function eliminarHorario(horarioId: string): Promise<ActionResult<null>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    const [eliminado] = await db
      .delete(horarios)
      .where(and(eq(horarios.id, horarioId), eq(horarios.tenantId, user.tenantId)))
      .returning();

    if (!eliminado) return { success: false, error: "Horario no encontrado." };

    return { success: true, data: null };
  } catch (error) {
    console.error("Error al eliminar horario:", error);
    return { success: false, error: "No se pudo eliminar el horario." };
  }
}
