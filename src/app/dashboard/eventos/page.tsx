import { Plus, Trophy } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EventoCard } from "@/features/eventos/components/EventoCard";
import { getEventosByTenant } from "@/features/eventos/queries";

export default async function EventosPage() {
  const eventos = await getEventosByTenant();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Eventos</h2>
        <Button nativeButton={false} render={<Link href="/dashboard/eventos/nuevo" />}>
          <Plus className="size-4" aria-hidden />
          Nuevo evento
        </Button>
      </div>

      {eventos.length === 0 ? (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3 text-center">
          <Trophy className="size-10 text-muted-foreground" aria-hidden />
          <h3 className="text-lg font-semibold">Todavía no tienes eventos</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crea tu primer evento competitivo para empezar a configurar grupos, escalas y
            actividades.
          </p>
          <Button nativeButton={false} render={<Link href="/dashboard/eventos/nuevo" />}>
            Crear mi primer evento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <EventoCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </div>
  );
}
