import { notFound } from "next/navigation";

import { getEscalasByEvento } from "@/features/escalas/queries";
import { getEventoById } from "@/features/eventos/queries";
import { EscalaList } from "@/features/escalas/components/EscalaList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Escalas de puntuación - EventRank",
};

export default async function EscalasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. Validar que el evento exista
  const evento = await getEventoById(id);
  if (!evento) notFound();

  // 2. Obtener las escalas
  const escalas = await getEscalasByEvento(id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/eventos/${id}`} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary w-fit transition-colors">
          <ArrowLeft className="mr-1 size-4" /> Volver al Evento
        </Link>
        <h2 className="text-xl font-bold">Escalas de puntuación</h2>
        <p className="text-sm text-muted-foreground">
          Define las reglas de puntos para las actividades de <strong>{evento.nombre}</strong>.
        </p>
      </div>

      <EscalaList escalas={escalas} eventoId={evento.id} />
    </div>
  );
}
