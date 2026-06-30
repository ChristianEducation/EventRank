import { notFound } from "next/navigation";
import { getEventoPublico, getHorariosPublicos, getActividadesPublicas } from "@/features/portal/queries";
import { HorariosPublicosList } from "@/features/portal/components/HorariosPublicosList";

interface HorariosPublicosPageProps {
  params: Promise<{ slug: string }>;
}

export default async function HorariosPublicosPage({ params }: HorariosPublicosPageProps) {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);

  if (!evento) notFound();

  const horarios = await getHorariosPublicos(evento.id);
  const actividades = await getActividadesPublicas(evento.id);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground font-heading">
        Horarios
      </h2>

      <HorariosPublicosList horarios={horarios} actividades={actividades} />
    </div>
  );
}
