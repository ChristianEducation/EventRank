import { CalendarDays, Link2 } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Evento } from "../types";
import { EventoEstado } from "./EventoEstado";

function formatearFecha(fecha: string | null): string | null {
  if (!fecha) return null;
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });
}

export function EventoCard({ evento }: { evento: Evento }) {
  const inicio = formatearFecha(evento.fechaInicio);
  const fin = formatearFecha(evento.fechaFin);

  return (
    <Link href={`/dashboard/eventos/${evento.id}`} className="block">
      <Card className="rounded-2xl border-[3px] border-border shadow-clay transition-all duration-200 hover:-translate-y-1 hover:shadow-clay-hover">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{evento.nombre}</CardTitle>
            <EventoEstado estado={evento.estado} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {(inicio || fin) && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {inicio}
              {fin && inicio !== fin ? ` – ${fin}` : ""}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Link2 className="size-3.5" aria-hidden />
            /e/{evento.slug}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
