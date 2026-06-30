import { getBasesByEvento } from "@/features/bases/queries";
import { BaseList } from "@/features/bases/components/BaseList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BasesPageProps {
  params: Promise<{ id: string }>;
}

export default async function BasesPage({ params }: BasesPageProps) {
  const { id } = await params;
  const bases = await getBasesByEvento(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/eventos/${id}`} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary w-fit transition-colors">
          <ArrowLeft className="mr-1 size-4" /> Volver al Evento
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Reglamento y Bases</h2>
        <p className="text-muted-foreground mt-1">
          Administra las reglas del evento. Todo lo que esté &quot;Visible&quot; se mostrará en el portal público.
        </p>
      </div>

      <BaseList eventoId={id} bases={bases} />
    </div>
  );
}
