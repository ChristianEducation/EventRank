"use server";

import { and, count, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { grupos, puntajes } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import { grupoSchema, editarGrupoSchema, type GrupoInput, type EditarGrupoInput } from "./schemas";
import type { Grupo } from "./types";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const ERROR_GENERICO = "Ocurrió un error inesperado. Intenta de nuevo.";

export async function crearGrupo(
  eventoId: string,
  input: GrupoInput,
): Promise<ActionResult<Grupo>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  const parsed = grupoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  try {
    // Orden incremental: buscar el máximo orden actual en el evento
    const [{ maxOrden }] = await db
      .select({ maxOrden: max(grupos.orden) })
      .from(grupos)
      .where(and(eq(grupos.eventoId, eventoId), eq(grupos.tenantId, user.tenantId)));

    const nuevoOrden = (maxOrden ?? -1) + 1;

    const [grupo] = await db
      .insert(grupos)
      .values({
        tenantId: user.tenantId,
        eventoId,
        nombre: data.nombre,
        color: data.color,
        orden: nuevoOrden,
        activo: true,
      })
      .returning();

    revalidatePath(`/dashboard/eventos/${eventoId}/grupos`);
    return { success: true, data: grupo };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}

export async function editarGrupo(
  grupoId: string,
  input: EditarGrupoInput,
): Promise<ActionResult<Grupo>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  const parsed = editarGrupoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  try {
    const [existing] = await db
      .select()
      .from(grupos)
      .where(and(eq(grupos.id, grupoId), eq(grupos.tenantId, user.tenantId)));

    if (!existing) return { success: false, error: "Grupo no encontrado" };

    const [updated] = await db
      .update(grupos)
      .set({
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.orden !== undefined && { orden: data.orden }),
      })
      .where(and(eq(grupos.id, grupoId), eq(grupos.tenantId, user.tenantId)))
      .returning();

    revalidatePath(`/dashboard/eventos/${existing.eventoId}/grupos`);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}

export async function eliminarGrupo(grupoId: string): Promise<ActionResult<null>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  try {
    const [existing] = await db
      .select()
      .from(grupos)
      .where(and(eq(grupos.id, grupoId), eq(grupos.tenantId, user.tenantId)));

    if (!existing) return { success: false, error: "Grupo no encontrado" };

    // RN-06: verificar si el grupo tiene puntajes asociados
    const [{ total }] = await db
      .select({ total: count() })
      .from(puntajes)
      .where(and(eq(puntajes.grupoId, grupoId), eq(puntajes.tenantId, user.tenantId)));

    if (total > 0) {
      return {
        success: false,
        error: "No se puede eliminar un grupo con puntajes ingresados. Puedes desactivarlo en su lugar.",
      };
    }

    await db
      .delete(grupos)
      .where(and(eq(grupos.id, grupoId), eq(grupos.tenantId, user.tenantId)));

    revalidatePath(`/dashboard/eventos/${existing.eventoId}/grupos`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}

export async function desactivarGrupo(grupoId: string): Promise<ActionResult<Grupo>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  try {
    const [existing] = await db
      .select()
      .from(grupos)
      .where(and(eq(grupos.id, grupoId), eq(grupos.tenantId, user.tenantId)));

    if (!existing) return { success: false, error: "Grupo no encontrado" };

    // Idempotente: si ya está desactivado, devolvemos el estado actual sin error
    if (!existing.activo) return { success: true, data: existing };

    const [updated] = await db
      .update(grupos)
      .set({ activo: false })
      .where(and(eq(grupos.id, grupoId), eq(grupos.tenantId, user.tenantId)))
      .returning();

    revalidatePath(`/dashboard/eventos/${existing.eventoId}/grupos`);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}
