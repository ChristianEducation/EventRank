"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { activarEvento, duplicarEvento, finalizarEvento } from "../actions";
import type { Evento } from "../types";

export function EventoAcciones({ evento }: { evento: Evento }) {
  const router = useRouter();
  const [cargando, setCargando] = useState<"activar" | "finalizar" | "duplicar" | null>(null);

  async function manejarActivar() {
    setCargando("activar");
    const result = await activarEvento(evento.id);
    setCargando(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Evento activado. El portal público ya está disponible.");
    router.refresh();
  }

  async function manejarFinalizar() {
    setCargando("finalizar");
    const result = await finalizarEvento(evento.id);
    setCargando(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Evento finalizado");
    router.refresh();
  }

  async function manejarDuplicar() {
    setCargando("duplicar");
    const result = await duplicarEvento(evento.id);
    setCargando(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Evento duplicado");
    router.push(`/dashboard/eventos/${result.data.id}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {evento.estado === "borrador" && (
        <Button onClick={manejarActivar} disabled={cargando !== null}>
          {cargando === "activar" ? "Activando..." : "Activar evento"}
        </Button>
      )}
      {evento.estado === "activo" && (
        <Button variant="outline" onClick={manejarFinalizar} disabled={cargando !== null}>
          {cargando === "finalizar" ? "Finalizando..." : "Finalizar evento"}
        </Button>
      )}
      <Button variant="secondary" onClick={manejarDuplicar} disabled={cargando !== null}>
        {cargando === "duplicar" ? "Duplicando..." : "Duplicar evento"}
      </Button>
    </div>
  );
}
