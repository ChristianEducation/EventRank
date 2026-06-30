import { z } from "zod";

export const actividadSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(120, "Máximo 120 caracteres"),
  descripcion: z.string().max(2000, "Máximo 2000 caracteres").optional().or(z.literal("")),
  reglas: z.string().max(2000, "Máximo 2000 caracteres").optional().or(z.literal("")),
  // RN-07: Escala obligatoria
  escalaId: z.string().uuid("Debe seleccionar una escala de puntuación válida"),
});

export type ActividadInput = z.infer<typeof actividadSchema>;
export type EditarActividadInput = z.infer<typeof actividadSchema>; // Mismo schema para edición en este caso

// Schema para parseo y validación de las filas del CSV en carga masiva
export const filaActividadSchema = z.object({
  nombre: z.string().min(1, "El nombre no puede estar vacío").max(120),
  descripcion: z.string().max(2000).optional(),
  reglas: z.string().max(2000).optional(),
  nombre_escala: z.string().min(1, "El nombre de la escala es obligatorio"),
});
