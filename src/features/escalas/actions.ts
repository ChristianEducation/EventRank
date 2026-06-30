"use server";

import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { escalasPuntaje, actividades } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { escalaSchema, editarEscalaSchema, type EscalaInput, type EditarEscalaInput } from "./schemas";
import type { Escala } from "./types";

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function crearEscala(eventoId: string, input: EscalaInput): Promise<ActionResult<Escala>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = escalaSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de escala inválidos" };
  }

  try {
    const [nuevaEscala] = await db
      .insert(escalasPuntaje)
      .values({
        tenantId: user.tenantId,
        eventoId,
        nombre: parsed.data.nombre,
        puntajes: parsed.data.puntajes,
      })
      .returning();

    return { success: true, data: nuevaEscala as Escala };
  } catch (error) {
    console.error("Error al crear escala:", error);
    return { success: false, error: "Ocurrió un error al crear la escala" };
  }
}

export async function editarEscala(escalaId: string, input: EditarEscalaInput): Promise<ActionResult<Escala>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = editarEscalaSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de escala inválidos" };
  }

  try {
    const [escalaActualizada] = await db
      .update(escalasPuntaje)
      .set(parsed.data)
      .where(and(eq(escalasPuntaje.id, escalaId), eq(escalasPuntaje.tenantId, user.tenantId)))
      .returning();

    if (!escalaActualizada) {
      return { success: false, error: "Escala no encontrada" };
    }

    return { success: true, data: escalaActualizada as Escala };
  } catch (error) {
    console.error("Error al editar escala:", error);
    return { success: false, error: "Ocurrió un error al editar la escala" };
  }
}

export async function eliminarEscala(escalaId: string): Promise<ActionResult<null>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    // Validar si la escala está en uso por alguna actividad
    const actAsociadas = await db
      .select({ id: actividades.id })
      .from(actividades)
      .where(and(eq(actividades.escalaId, escalaId), eq(actividades.tenantId, user.tenantId)));

    if (actAsociadas.length > 0) {
      return { 
        success: false, 
        error: "No se puede eliminar la escala porque hay actividades que la están usando." 
      };
    }

    const [escalaEliminada] = await db
      .delete(escalasPuntaje)
      .where(and(eq(escalasPuntaje.id, escalaId), eq(escalasPuntaje.tenantId, user.tenantId)))
      .returning();

    if (!escalaEliminada) {
      return { success: false, error: "Escala no encontrada" };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Error al eliminar escala:", error);
    return { success: false, error: "Ocurrió un error al eliminar la escala" };
  }
}
