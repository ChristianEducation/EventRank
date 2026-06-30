import { getActividadesByEvento } from "@/features/actividades/queries";
import { getEscalasByEvento } from "@/features/escalas/queries";
import { ActividadList } from "@/features/actividades/components/ActividadList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ActividadesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActividadesPage({ params }: ActividadesPageProps) {
  const { id } = await params;
  
  // Ejecutamos ambas consultas en paralelo
  const [actividades, escalasDisponibles] = await Promise.all([
    getActividadesByEvento(id),
    getEscalasByEvento(id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/eventos/${id}`} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary w-fit transition-colors">
          <ArrowLeft className="mr-1 size-4" /> Volver al Evento
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Actividades</h2>
        <p className="text-muted-foreground mt-1">
          Administra las competencias y pruebas de tu evento.
        </p>
      </div>

      <ActividadList 
        actividades={actividades} 
        escalasDisponibles={escalasDisponibles} 
        eventoId={id} 
      />
    </div>
  );
}
