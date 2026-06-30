import { z } from "zod";

export const escalaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60, "El nombre es muy largo"),
  puntajes: z
    .record(
      z.string().regex(/^\d+$/, "Las posiciones deben ser números enteros (ej: '1')"),
      z.preprocess((val) => Number(val), z.number().int("Los puntajes deben ser enteros").min(0, "Los puntajes no pueden ser negativos"))
    )
    .refine((p) => Object.keys(p).length >= 1, {
      message: "La escala debe tener al menos un lugar definido",
    }),
});

export type EscalaInput = z.infer<typeof escalaSchema>;

// Schema para edición (por ahora idéntico al de creación, pero preparado por si se desacoplan en el futuro)
export const editarEscalaSchema = escalaSchema.partial();
export type EditarEscalaInput = z.infer<typeof editarEscalaSchema>;
