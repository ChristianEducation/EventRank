import { notFound } from "next/navigation";
import { getEventoPublico, getActividadesPublicas } from "@/features/portal/queries";
import { ActividadesPublicasList } from "@/features/portal/components/ActividadesPublicasList";

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
          <h3 className="text-lg font-bold text-foreground">Aún no hay competencias</h3>
        </div>
      ) : (
        <ActividadesPublicasList actividades={actividades} />
      )}
    </div>
  );
}
