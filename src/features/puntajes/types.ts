import { InferSelectModel } from "drizzle-orm";
import { puntajes } from "@/lib/db/schema";
import type { Grupo } from "@/features/grupos/types";
import type { Actividad } from "@/features/actividades/types";

export type PuntajeDb = InferSelectModel<typeof puntajes>;

// Tipo extendido para mostrar información en las tablas y el ranking
export type Puntaje = PuntajeDb & {
  grupo?: Grupo;
  actividad?: Actividad;
};

// Estructura optimizada para la tabla de ranking final
export interface RankingGrupo {
  posicion: number;
  grupoId: string;
  nombre: string;
  color: string;
  puntos_totales: number;
}
