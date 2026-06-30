import { z } from "zod";

export const crearHorarioSchema = z.object({
  nombreActividad: z.string().min(1, "El nombre es obligatorio").max(120, "El nombre es muy largo"),
  fecha: z.coerce.date(),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato inválido (HH:MM)"),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato inválido (HH:MM)").optional().or(z.literal("")),
  lugar: z.string().max(120).optional().or(z.literal("")),
  jornada: z.enum(["mañana", "tarde", "noche"]).optional().or(z.literal("")),
}).refine(
  (data) => {
    if (!data.horaFin) return true; // Si no hay hora fin, es válido
    return data.horaFin > data.horaInicio;
  },
  {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["horaFin"],
  }
);

export type CrearHorarioInput = z.infer<typeof crearHorarioSchema>;
export type EditarHorarioInput = CrearHorarioInput;
