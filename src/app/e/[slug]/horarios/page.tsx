import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, MapPin, CalendarDays } from "lucide-react";
import { getEventoPublico, getHorariosPublicos } from "@/features/portal/queries";

interface HorariosPublicosPageProps {
  params: Promise<{ slug: string }>;
}

export default async function HorariosPublicosPage({ params }: HorariosPublicosPageProps) {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);

  if (!evento) notFound();

  const horarios = await getHorariosPublicos(evento.id);

  // Agrupar por fecha
  const grouped = horarios.reduce((acc, curr) => {
    const key = curr.fecha;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, typeof horarios>);

  const dates = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col gap-6 pb-8">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground font-heading">
        Agenda
      </h2>

      {dates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-[3px] border-dashed border-border/50 rounded-3xl bg-card">
          <CalendarDays className="size-10 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">Aún no hay agenda publicada</h3>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {dates.map((dateKey) => {
            const items = grouped[dateKey];
            const dateStr = format(parseISO(dateKey), "EEEE d 'de' MMMM", { locale: es });
            
            return (
              <div key={dateKey} className="flex flex-col gap-4">
                <h3 className="text-lg font-bold capitalize text-primary border-b-[3px] border-primary/20 pb-2">
                  {dateStr}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((h) => (
                    <div key={h.id} className="flex flex-col rounded-2xl border-[3px] border-border bg-card p-4 shadow-clay-sm">
                      <h4 className="font-bold text-foreground leading-tight mb-2">{h.nombreActividad}</h4>
                      
                      <div className="flex flex-col gap-1.5 mt-auto text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-orange-500" />
                          <span>{h.horaInicio.slice(0,5)} {h.horaFin ? `- ${h.horaFin.slice(0,5)}` : ""}</span>
                        </div>
                        {h.lugar && (
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-blue-500" />
                            <span className="truncate">{h.lugar}</span>
                          </div>
                        )}
                        {h.jornada && (
                          <div className="mt-1 inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-bold capitalize text-foreground border border-border/50">
                            Jornada: {h.jornada}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
