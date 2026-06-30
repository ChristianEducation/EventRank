import { eventos } from "@/lib/db/schema";

export type Evento = typeof eventos.$inferSelect;

export type EstadoEvento = Evento["estado"];

export type TipoAccesoEvento = Evento["tipoAcceso"];
