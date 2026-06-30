import { InferSelectModel } from "drizzle-orm";
import { actividades } from "@/lib/db/schema";
import type { Escala } from "@/features/escalas/types";

export type ActividadDb = InferSelectModel<typeof actividades>;

// Actividad extendida para la UI que puede incluir información de la escala vinculada
export type Actividad = ActividadDb & {
  escala?: Escala;
};

// Tipos para carga masiva
export interface FilaActividad {
  nombre: string;
  descripcion?: string;
  reglas?: string;
  nombre_escala: string;
}

export interface ErrorFila {
  fila: number;
  motivo: string;
}

export interface ResultadoCargaMasiva {
  creadas: number;
  errores: ErrorFila[];
}
