"use server";

import { getDetallePuntajesAlianza, getResultadosPublicos } from "./queries";

export async function getDetallePuntajesAlianzaAccion(eventoId: string, grupoId: string) {
  try {
    const data = await getDetallePuntajesAlianza(eventoId, grupoId);
    return data;
  } catch (error) {
    console.error("Error al obtener detalle de puntajes:", error);
    return [];
  }
}

export async function getResultadosPublicosAccion(eventoId: string) {
  try {
    const data = await getResultadosPublicos(eventoId);
    return data;
  } catch (error) {
    console.error("Error al obtener resultados públicos:", error);
    return [];
  }
}
