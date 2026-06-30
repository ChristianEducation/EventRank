import { getHorariosByEvento } from "@/features/horarios/queries";
import { HorarioList } from "@/features/horarios/components/HorarioList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HorariosPageProps {
  params: Promise<{ id: string }>;
}

export default async function HorariosPage({ params }: HorariosPageProps) {
  const { id } = await params;
  const horarios = await getHorariosByEvento(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/eventos/${id}`} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary w-fit transition-colors">
          <ArrowLeft className="mr-1 size-4" /> Volver al Evento
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Agenda y Horarios</h2>
        <p className="text-muted-foreground mt-1">
          Organiza el cronograma de actividades del evento.
        </p>
      </div>

      <HorarioList eventoId={id} horarios={horarios} />
    </div>
  );
}
