import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Swords, Users, Target, Trophy, CalendarDays, BookOpen } from "lucide-react";

import { EventoAcciones } from "@/features/eventos/components/EventoAcciones";
import { EventoEstado } from "@/features/eventos/components/EventoEstado";
import { EventoForm } from "@/features/eventos/components/EventoForm";
import { getEventoById } from "@/features/eventos/queries";

export default async function EventoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await getEventoById(id);

  if (!evento) notFound();

  const secciones = [
    { label: "Puntajes", href: `/dashboard/eventos/${id}/puntajes`, icon: Trophy, color: "text-yellow-600 bg-yellow-100 border-yellow-200" },
    { label: "Grupos", href: `/dashboard/eventos/${id}/grupos`, icon: Users, color: "text-blue-600 bg-blue-100 border-blue-200" },
    { label: "Escalas", href: `/dashboard/eventos/${id}/escalas`, icon: Target, color: "text-green-600 bg-green-100 border-green-200" },
    { label: "Actividades", href: `/dashboard/eventos/${id}/actividades`, icon: Swords, color: "text-orange-600 bg-orange-100 border-orange-200" },
    { label: "Agenda", href: `/dashboard/eventos/${id}/horarios`, icon: CalendarDays, color: "text-purple-600 bg-purple-100 border-purple-200" },
    { label: "Bases", href: `/dashboard/eventos/${id}/bases`, icon: BookOpen, color: "text-amber-600 bg-amber-100 border-amber-200" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{evento.nombre}</h2>
        <EventoEstado estado={evento.estado} />
      </div>

      <EventoAcciones evento={evento} />

      <Link
        href={`/e/${evento.slug}`}
        target="_blank"
        className="group relative overflow-hidden rounded-2xl border-[3px] border-primary bg-primary p-4 shadow-clay transition-all hover:-translate-y-1 hover:shadow-clay-lg flex items-center justify-between"
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md">
            <Trophy className="size-6" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black text-white text-lg">Ver Portal Público</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Así lo verán los alumnos (Mobile-first)</span>
          </div>
        </div>
        <ChevronRight className="size-6 text-white transition-transform group-hover:translate-x-1 relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
      </Link>

      {/* Navegación a subsecciones del evento */}
      <nav aria-label="Secciones del evento" className="flex flex-col gap-2">
        {secciones.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group block rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-xl shadow-sm border ${s.color}`}>
                  <s.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{s.label}</h3>
                  <p className="text-sm text-muted-foreground">Configuración de {s.label.toLowerCase()}</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </nav>

      {evento.estado === "finalizado" ? (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Este evento está finalizado y es de solo lectura.
        </p>
      ) : (
        <EventoForm evento={evento} />
      )}
    </div>
  );
}
