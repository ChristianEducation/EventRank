"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getDetallePuntajesAlianzaAccion } from "../actions";

interface DetallePuntaje {
  id: string;
  lugar: number;
  puntajeBase: number;
  bonificacion: number;
  sancion: number;
  comodin: boolean;
  puntajeFinal: number;
  actividadNombre: string;
  fecha: Date;
}

interface AlianzaDetalleModalProps {
  eventoId: string;
  grupoId: string;
  grupoNombre: string;
  grupoColor: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlianzaDetalleModal({
  eventoId,
  grupoId,
  grupoNombre,
  grupoColor,
  open,
  onOpenChange,
}: AlianzaDetalleModalProps) {
  const [detalles, setDetalles] = useState<DetallePuntaje[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    async function cargarDetalles() {
      setCargando(true);
      try {
        const data = await getDetallePuntajesAlianzaAccion(eventoId, grupoId);
        setDetalles(data as unknown as DetallePuntaje[]);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    }

    if (open && grupoId) {
      cargarDetalles();
    }
  }, [open, grupoId, eventoId]);

  const getLugarColor = (lugar: number) => {
    if (lugar === 1) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    if (lugar === 2) return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    if (lugar === 3) return "text-amber-700 bg-amber-700/10 border-amber-700/20";
    return "text-muted-foreground bg-muted border-border";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-[3px] border-border shadow-clay">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <span
              className="size-10 rounded-full border-[3px] border-border shadow-clay-sm flex-shrink-0"
              style={{ backgroundColor: grupoColor || "var(--muted)" }}
            />
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {grupoNombre}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Historial de Actividades
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p>Cargando resultados...</p>
            </div>
          ) : detalles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Trophy className="size-12 opacity-20 mb-4" />
              <p className="font-medium text-foreground">Sin resultados publicados</p>
              <p className="text-sm">Esta alianza aún no tiene resultados registrados en el portal.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {detalles.map((d) => (
                <div 
                  key={d.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border-2 border-border/50 bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground line-clamp-1" title={d.actividadNombre}>
                      {d.actividadNombre}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(d.fecha), "d 'de' MMMM, HH:mm", { locale: es })}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {d.comodin && (
                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                          Comodín (+{d.bonificacion})
                        </Badge>
                      )}
                      {d.sancion > 0 && (
                        <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                          Sanción (-{d.sancion})
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-row-reverse">
                    <div className="text-right">
                      <div className="font-black text-xl text-primary font-mono tracking-tight">
                        {d.puntajeFinal.toLocaleString()}
                        <span className="text-xs text-muted-foreground font-sans tracking-normal ml-1">pts</span>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-center size-10 rounded-xl border-2 font-bold text-lg shadow-sm ${getLugarColor(d.lugar)}`}>
                      {d.lugar}
                      <span className="text-[10px] uppercase ml-0.5">°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
