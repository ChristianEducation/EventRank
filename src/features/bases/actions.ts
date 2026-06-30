"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { reglasGenerales } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import {
  crearBaseSchema,
  type CrearBaseInput,
  type EditarBaseInput,
} from "./schemas";
import type { Base } from "./types";
import { type ActionResult } from "@/features/escalas/actions";

export async function crearBase(eventoId: string, input: CrearBaseInput): Promise<ActionResult<Base>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = crearBaseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de base inválidos." };
  }

  const { titulo, contenido, categoria, orden, visible } = parsed.data;

  try {
    const [nuevaBase] = await db
      .insert(reglasGenerales)
      .values({
        tenantId: user.tenantId,
        eventoId,
        titulo,
        contenido,
        categoria: categoria || null,
        orden,
        visible,
      })
      .returning();

    return { success: true, data: nuevaBase as Base };
  } catch (error) {
    console.error("Error al crear base:", error);
    return { success: false, error: "Ocurrió un error al guardar la sección." };
  }
}

export async function editarBase(baseId: string, input: EditarBaseInput): Promise<ActionResult<Base>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = crearBaseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de base inválidos." };
  }

  const { titulo, contenido, categoria, orden, visible } = parsed.data;

  try {
    const [actualizado] = await db
      .update(reglasGenerales)
      .set({
        titulo,
        contenido,
        categoria: categoria || null,
        orden,
        visible,
      })
      .where(and(eq(reglasGenerales.id, baseId), eq(reglasGenerales.tenantId, user.tenantId)))
      .returning();

    if (!actualizado) return { success: false, error: "Sección no encontrada." };
    
    return { success: true, data: actualizado as Base };
  } catch (error) {
    console.error("Error al editar base:", error);
    return { success: false, error: "Error al actualizar la sección." };
  }
}

export async function eliminarBase(baseId: string): Promise<ActionResult<null>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    const [eliminado] = await db
      .delete(reglasGenerales)
      .where(and(eq(reglasGenerales.id, baseId), eq(reglasGenerales.tenantId, user.tenantId)))
      .returning();

    if (!eliminado) return { success: false, error: "Sección no encontrada." };

    return { success: true, data: null };
  } catch (error) {
    console.error("Error al eliminar base:", error);
    return { success: false, error: "No se pudo eliminar la sección." };
  }
}

export async function toggleVisibleBase(baseId: string, nuevoEstado: boolean): Promise<ActionResult<Base>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    const [actualizado] = await db
      .update(reglasGenerales)
      .set({ visible: nuevoEstado })
      .where(and(eq(reglasGenerales.id, baseId), eq(reglasGenerales.tenantId, user.tenantId)))
      .returning();

    if (!actualizado) return { success: false, error: "Sección no encontrada." };
    
    return { success: true, data: actualizado as Base };
  } catch {
    return { success: false, error: "No se pudo cambiar la visibilidad." };
  }
}
