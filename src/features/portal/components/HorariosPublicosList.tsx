"use client";

import { useState, useMemo } from "react";
import { format, parseISO, isAfter, set, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, MapPin, CalendarDays, BookOpen, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Horario {
  id: string;
  nombreActividad: string;
  fecha: string;
  horaInicio: string;
  horaFin: string | null;
  lugar: string | null;
  jornada: string | null;
}

interface Actividad {
  id: string;
  nombre: string;
  descripcion?: string | null;
  reglas?: string | null;
}

interface HorariosPublicosListProps {
  horarios: Horario[];
  actividades: Actividad[];
}

export function HorariosPublicosList({ horarios, actividades }: HorariosPublicosListProps) {
  const [mostrarSoloProximas, setMostrarSoloProximas] = useState(true);
  const [filtroLugar, setFiltroLugar] = useState<string>("todos");
  const [filtroJornada, setFiltroJornada] = useState<string>("todas");
  
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);

  // Lugares únicos para el filtro
  const lugares = useMemo(() => {
    const l = new Set<string>();
    horarios.forEach(h => {
      if (h.lugar) l.add(h.lugar);
    });
    return Array.from(l).sort();
  }, [horarios]);

  // Filtrado de horarios
  const horariosFiltrados = useMemo(() => {
    let result = horarios;

    if (mostrarSoloProximas) {
      const now = new Date();
      result = result.filter(h => {
        const [hours, minutes] = h.horaInicio.split(":").map(Number);
        const eventDate = set(parseISO(h.fecha), { hours, minutes, seconds: 0 });
        
        // Mostrar si el evento es hoy en adelante
        // Para simplificar, si horaFin existe y ya pasó, se oculta.
        // Si no hay hora fin, se oculta 1 hora después de horaInicio.
        const endHours = h.horaFin ? Number(h.horaFin.split(":")[0]) : hours + 1;
        const endMinutes = h.horaFin ? Number(h.horaFin.split(":")[1]) : minutes;
        const eventEndDate = set(parseISO(h.fecha), { hours: endHours, minutes: endMinutes, seconds: 0 });
        
        return isAfter(eventEndDate, now) || startOfDay(eventDate) > startOfDay(now);
      });
    }

    if (filtroLugar !== "todos") {
      result = result.filter(h => h.lugar === filtroLugar);
    }

    if (filtroJornada !== "todas") {
      result = result.filter(h => h.jornada === filtroJornada);
    }

    return result;
  }, [horarios, mostrarSoloProximas, filtroLugar, filtroJornada]);

  // Agrupación por fecha
  const grouped = useMemo(() => {
    return horariosFiltrados.reduce((acc, curr) => {
      const key = curr.fecha;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {} as Record<string, Horario[]>);
  }, [horariosFiltrados]);

  const dates = Object.keys(grouped).sort();

  const handleHorarioClick = (h: Horario) => {
    // Buscar la actividad correspondiente por nombre
    const matched = actividades.find(a => a.nombre.toLowerCase() === h.nombreActividad.toLowerCase());
    if (matched && (matched.reglas || matched.descripcion)) {
      setSelectedActividad(matched);
    } else {
      // Si no hay reglas, podemos mostrar un popup genérico o nada.
      // Por ahora, mostraremos un fallback con el nombre
      setSelectedActividad({
        id: "temp",
        nombre: h.nombreActividad,
        descripcion: `Lugar: ${h.lugar || "No especificado"} | Horario: ${h.horaInicio.slice(0,5)}`
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 bg-card p-4 rounded-3xl border-[3px] border-border shadow-clay-sm">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="size-4 text-primary" />
          <span className="font-bold text-sm text-foreground">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={mostrarSoloProximas ? "default" : "outline"} 
            size="sm"
            onClick={() => setMostrarSoloProximas(!mostrarSoloProximas)}
            className="rounded-xl font-bold"
          >
            {mostrarSoloProximas ? "Mostrando próximas" : "Mostrar todas"}
          </Button>

          {lugares.length > 0 && (
            <select 
              className="h-9 px-3 text-sm font-semibold rounded-xl border-2 border-border bg-background focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              value={filtroLugar}
              onChange={(e) => setFiltroLugar(e.target.value)}
            >
              <option value="todos">Todos los lugares</option>
              {lugares.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          )}

          <select 
            className="h-9 px-3 text-sm font-semibold rounded-xl border-2 border-border bg-background focus:ring-2 focus:ring-primary outline-none cursor-pointer"
            value={filtroJornada}
            onChange={(e) => setFiltroJornada(e.target.value)}
          >
            <option value="todas">Todas las jornadas</option>
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
          </select>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-[3px] border-dashed border-border/50 rounded-3xl bg-card">
          <CalendarDays className="size-10 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">No hay horarios para mostrar</h3>
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
                    <button 
                      key={h.id}
                      onClick={() => handleHorarioClick(h)}
                      className="group flex flex-col text-left rounded-2xl border-[3px] border-border bg-card p-4 shadow-clay-sm transition-all hover:border-primary/50 hover:bg-muted/30 hover:-translate-y-0.5 relative overflow-hidden"
                    >
                      <h4 className="font-bold text-foreground leading-tight mb-2 pr-6 group-hover:text-primary transition-colors">{h.nombreActividad}</h4>
                      
                      <BookOpen className="absolute top-4 right-4 size-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />

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
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle */}
      <Dialog open={!!selectedActividad} onOpenChange={(open) => !open && setSelectedActividad(null)}>
        <DialogContent className="sm:max-w-md bg-card border-[3px] border-border shadow-clay mx-4 w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedActividad?.nombre}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 mt-2 max-h-[60vh] overflow-y-auto pr-2">
            
            {selectedActividad?.descripcion && (
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Detalles</span>
                <p className="text-sm text-foreground leading-relaxed">{selectedActividad.descripcion}</p>
              </div>
            )}
            
            {selectedActividad?.reglas && (
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Reglas y Condiciones</span>
                <div className="text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border/50 whitespace-pre-wrap">
                  {selectedActividad.reglas}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
