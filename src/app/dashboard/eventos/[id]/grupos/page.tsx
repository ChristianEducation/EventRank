import { notFound } from "next/navigation";

import { getEventoById } from "@/features/eventos/queries";
import { getGruposByEvento } from "@/features/grupos/queries";
import { GrupoList } from "@/features/grupos/components/GrupoList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function GruposPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await getEventoById(id);
  if (!evento) notFound();

  const grupos = await getGruposByEvento(id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/eventos/${id}`} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary w-fit transition-colors">
          <ArrowLeft className="mr-1 size-4" /> Volver al Evento
        </Link>
        <h2 className="text-xl font-semibold">Grupos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona los grupos o alianzas que compiten en{" "}
          <span className="font-medium text-foreground">{evento.nombre}</span>.
        </p>
      </div>

      {evento.estado === "finalizado" ? (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Este evento está finalizado. Los grupos son de solo lectura.
        </p>
      ) : (
        <GrupoList grupos={grupos} eventoId={id} />
      )}
    </div>
  );
}
