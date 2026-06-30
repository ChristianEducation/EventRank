import { z } from "zod";

export const ingresarPuntajeSchema = z.object({
  actividadId: z.string().uuid("Seleccione una actividad válida"),
  grupoId: z.string().uuid("Seleccione un grupo válido"),
  lugar: z.preprocess((val) => Number(val), z.number().int().min(1, "El lugar debe ser al menos 1")),
  comodin: z.boolean().default(false),
  bonificacion: z.preprocess((val) => Number(val), z.number().int().min(0, "La bonificación no puede ser negativa").default(0)),
  sancion: z.preprocess((val) => Number(val), z.number().int().min(0, "La sanción no puede ser negativa").default(0)),
  publico: z.boolean().default(false),
});

export type IngresarPuntajeInput = z.infer<typeof ingresarPuntajeSchema>;
export type EditarPuntajeInput = Omit<IngresarPuntajeInput, "actividadId" | "grupoId"> & { 
  lugar: number;
  comodin: boolean;
  bonificacion: number;
  sancion: number;
  publico: boolean;
};

export const bulkPuntajesSchema = z.object({
  actividadId: z.string().uuid("Seleccione una actividad válida"),
  resultados: z.array(z.object({
    grupoId: z.string().uuid(),
    lugar: z.preprocess((val) => Number(val), z.number().int().min(1, "Lugar debe ser al menos 1").nullable()),
    comodin: z.boolean().default(false),
    bonificacion: z.preprocess((val) => Number(val), z.number().int().min(0).default(0)),
    sancion: z.preprocess((val) => Number(val), z.number().int().min(0).default(0)),
  }))
});

export type BulkPuntajesInput = z.infer<typeof bulkPuntajesSchema>;
