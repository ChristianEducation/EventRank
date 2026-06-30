"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { actividades, escalasPuntaje } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import {
  actividadSchema,
  filaActividadSchema,
  type ActividadInput,
  type EditarActividadInput,
} from "./schemas";
import type { Actividad, FilaActividad, ResultadoCargaMasiva, ErrorFila } from "./types";
import { type ActionResult } from "@/features/escalas/actions"; // Reutilizamos ActionResult

export async function crearActividad(eventoId: string, input: ActividadInput): Promise<ActionResult<Actividad>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = actividadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos (verifique la escala asignada)" };
  }

  // RN-07: Validar explícitamente que la escala exista y pertenezca al evento/tenant
  const [escala] = await db
    .select()
    .from(escalasPuntaje)
    .where(and(eq(escalasPuntaje.id, parsed.data.escalaId), eq(escalasPuntaje.tenantId, user.tenantId)));
    
  if (!escala) {
    return { success: false, error: "La escala de puntuación seleccionada no existe o no tiene acceso." };
  }

  try {
    const [nuevaActividad] = await db
      .insert(actividades)
      .values({
        tenantId: user.tenantId,
        eventoId,
        ...parsed.data,
      })
      .returning();

    return { success: true, data: nuevaActividad as Actividad };
  } catch (error) {
    console.error("Error al crear actividad:", error);
    return { success: false, error: "Ocurrió un error al crear la actividad" };
  }
}

export async function editarActividad(actividadId: string, input: EditarActividadInput): Promise<ActionResult<Actividad>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  const parsed = actividadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  try {
    const [actividadActualizada] = await db
      .update(actividades)
      .set(parsed.data)
      .where(and(eq(actividades.id, actividadId), eq(actividades.tenantId, user.tenantId)))
      .returning();

    if (!actividadActualizada) {
      return { success: false, error: "Actividad no encontrada" };
    }

    return { success: true, data: actividadActualizada as Actividad };
  } catch (error) {
    console.error("Error al editar actividad:", error);
    return { success: false, error: "Ocurrió un error al editar la actividad" };
  }
}

export async function eliminarActividad(actividadId: string): Promise<ActionResult<null>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    // Si hubiese tabla 'puntajes', aquí se validaría no borrar actividades con puntajes.
    // Por ahora, borrado simple con tenant scope.
    const [actividadEliminada] = await db
      .delete(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.tenantId, user.tenantId)))
      .returning();

    if (!actividadEliminada) {
      return { success: false, error: "Actividad no encontrada" };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Error al eliminar actividad:", error);
    return { success: false, error: "Ocurrió un error al eliminar la actividad" };
  }
}

export async function procesarCargaMasiva(
  eventoId: string,
  filas: FilaActividad[]
): Promise<ActionResult<ResultadoCargaMasiva>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autorizado" };

  if (!filas || filas.length === 0) {
    return { success: false, error: "El archivo está vacío." };
  }

  // 1. Obtener todas las escalas de este evento para mapear nombres a IDs (RN-07)
  const escalasDelEvento = await db
    .select({ id: escalasPuntaje.id, nombre: escalasPuntaje.nombre })
    .from(escalasPuntaje)
    .where(and(eq(escalasPuntaje.eventoId, eventoId), eq(escalasPuntaje.tenantId, user.tenantId)));

  const mapaEscalas = new Map<string, string>();
  escalasDelEvento.forEach((e) => mapaEscalas.set(e.nombre.toLowerCase().trim(), e.id));

  const errores: ErrorFila[] = [];
  const validDataToInsert: {
    tenantId: string;
    eventoId: string;
    nombre: string;
    descripcion: string | null;
    reglas: string | null;
    escalaId: string;
  }[] = [];

  // 2. Iterar sobre las filas y validar
  filas.forEach((fila, index) => {
    const filaNumber = index + 1;
    
    // a. Validar formato
    const parsedFila = filaActividadSchema.safeParse(fila);
    if (!parsedFila.success) {
      errores.push({
        fila: filaNumber,
        motivo: `Formato inválido: ${parsedFila.error.issues[0]?.message || "Validación falló"}`,
      });
      return; // Skip this row
    }

    // b. Validar que la escala exista
    const nombreEscalaLimpiado = parsedFila.data.nombre_escala.toLowerCase().trim();
    const escalaId = mapaEscalas.get(nombreEscalaLimpiado);

    if (!escalaId) {
      errores.push({
        fila: filaNumber,
        motivo: `La escala '${parsedFila.data.nombre_escala}' no existe en este evento.`,
      });
      return; // Skip this row
    }

    // c. Preparar inserción
    validDataToInsert.push({
      tenantId: user.tenantId,
      eventoId,
      nombre: parsedFila.data.nombre,
      descripcion: parsedFila.data.descripcion || null,
      reglas: parsedFila.data.reglas || null,
      escalaId,
    });
  });

  // 3. Insertar las válidas en la BD
  let creadas = 0;
  if (validDataToInsert.length > 0) {
    try {
      const inserted = await db.insert(actividades).values(validDataToInsert).returning({ id: actividades.id });
      creadas = inserted.length;
    } catch (e) {
      console.error("Error al insertar carga masiva:", e);
      return { success: false, error: "Falló la inserción masiva en la base de datos." };
    }
  }

  return {
    success: true,
    data: {
      creadas,
      errores,
    },
  };
}
