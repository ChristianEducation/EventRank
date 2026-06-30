import { notFound } from "next/navigation";
import { getEventoPublico, getRankingPublico } from "@/features/portal/queries";
import { RankingTiempoReal } from "@/features/portal/components/RankingTiempoReal";

interface PortalRankingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PortalRankingPage({ params }: PortalRankingPageProps) {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);

  if (!evento) {
    notFound();
  }

  const ranking = await getRankingPublico(evento.id);
  const finalizado = evento.estado === "finalizado";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground font-heading">
          Tabla de Posiciones
        </h2>
        {/* Aquí podría ir un selector de escala si en el futuro se piden rankings separados */}
      </div>

      <RankingTiempoReal 
        eventoId={evento.id} 
        initialRanking={ranking} 
        eventoFinalizado={finalizado}
      />
    </div>
  );
}
