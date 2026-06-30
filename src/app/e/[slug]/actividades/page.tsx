import { notFound } from "next/navigation";
import { getEventoPublico, getActividadesPublicas } from "@/features/portal/queries";
import { Swords } from "lucide-react";

interface ActividadesPublicasPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ActividadesPublicasPage({ params }: ActividadesPublicasPageProps) {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);

  if (!evento) notFound();

  const actividades = await getActividadesPublicas(evento.id);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground font-heading">
        Competencias
      </h2>

      {actividades.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-[3px] border-dashed border-border/50 rounded-3xl bg-card">
          <Swords className="size-10 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">Aún no hay competencias</h3>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {actividades.map((act) => (
            <div key={act.id} className="flex flex-col p-4 rounded-2xl border-[3px] border-border shadow-clay-sm bg-card transition-transform hover:-translate-y-1">
              <h3 className="font-bold text-lg text-foreground mb-1 leading-tight">{act.nombre}</h3>
              {act.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-3">{act.descripcion}</p>
              )}
              {act.reglas && (
                <div className="mt-3 text-xs bg-muted/50 p-2 rounded-lg border border-border/50 font-medium">
                  <span className="font-bold block mb-1">Reglas específicas:</span>
                  {act.reglas}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
