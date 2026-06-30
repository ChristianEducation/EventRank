import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getEventoPublico, getBasesPublicas } from "@/features/portal/queries";

interface BasesPublicasPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BasesPublicasPage({ params }: BasesPublicasPageProps) {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);

  if (!evento) notFound();

  const bases = await getBasesPublicas(evento.id);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground font-heading">
        Reglamento
      </h2>

      {bases.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-[3px] border-dashed border-border/50 rounded-3xl bg-card">
          <BookOpen className="size-10 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">Reglamento no disponible</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-2">
            El organizador aún no ha publicado las bases de este evento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {bases.map((b) => (
            <div key={b.id} className="flex flex-col gap-3 rounded-2xl border-[3px] border-border bg-card p-5 shadow-clay-sm">
              <div className="flex flex-col gap-1 border-b-[3px] border-border/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-6 h-6 flex items-center justify-center bg-muted rounded-full shrink-0">
                    {b.orden}
                  </span>
                  <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight">
                    {b.titulo}
                  </h3>
                </div>
                {b.categoria && (
                  <Badge variant="secondary" className="w-fit ml-8 text-[10px] uppercase tracking-wider">{b.categoria}</Badge>
                )}
              </div>
              
              <div className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap mt-1 ml-1 leading-relaxed">
                {b.contenido}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
