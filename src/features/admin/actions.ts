"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventos } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function activarEventoManual(eventoId: string) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "super_admin") {
    return { success: false, error: "No autorizado" };
  }

  try {
    const [actualizado] = await db
      .update(eventos)
      .set({ estado: "activo" })
      .where(eq(eventos.id, eventoId))
      .returning();

    if (!actualizado) return { success: false, error: "Evento no encontrado." };
    
    return { success: true, data: actualizado };
  } catch (error) {
    console.error("Error al activar evento:", error);
    return { success: false, error: "Error al activar el evento." };
  }
}
