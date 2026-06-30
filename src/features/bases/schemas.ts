import { z } from "zod";

export const crearBaseSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio").max(160, "El título es muy largo"),
  contenido: z.string().min(1, "El contenido no puede estar vacío"),
  categoria: z.string().max(60).optional().or(z.literal("")),
  orden: z.preprocess((val) => Number(val), z.number().int().min(0).default(0)),
  visible: z.boolean().default(true),
});

export type CrearBaseInput = z.infer<typeof crearBaseSchema>;
export type EditarBaseInput = CrearBaseInput;
