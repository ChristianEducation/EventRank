import { getPuntajesByEvento } from "@/features/puntajes/queries";
import { getGruposByEvento } from "@/features/grupos/queries";
import { getActividadesByEvento } from "@/features/actividades/queries";
import { PuntajesList } from "@/features/puntajes/components/PuntajesList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PuntajesPageProps {
  params: Promise<{ id: string }>;
}

export default async function PuntajesPage({ params }: PuntajesPageProps) {
  const { id } = await params;
  
  // Ejecutamos consultas en paralelo para alimentar el form y la lista
  const [puntajes, grupos, actividades] = await Promise.all([
    getPuntajesByEvento(id),
    getGruposByEvento(id),
    getActividadesByEvento(id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/eventos/${id}`} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary w-fit transition-colors">
          <ArrowLeft className="mr-1 size-4" /> Volver al Evento
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Puntajes y Resultados</h2>
        <p className="text-muted-foreground mt-1">
          Ingresa los resultados, asigna comodines y publica los puntos.
        </p>
      </div>

      <PuntajesList 
        puntajes={puntajes}
        grupos={grupos}
        actividades={actividades}
      />
    </div>
  );
}
