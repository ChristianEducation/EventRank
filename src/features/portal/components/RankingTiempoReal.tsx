"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { AlianzaDetalleModal } from "./AlianzaDetalleModal";

interface GrupoRanking {
  id: string;
  nombre: string;
  color: string | null;
  puntajeTotal: number;
}

interface RankingTiempoRealProps {
  eventoId: string;
  initialRanking: GrupoRanking[];
  eventoFinalizado: boolean;
}

export function RankingTiempoReal({ eventoId, initialRanking, eventoFinalizado }: RankingTiempoRealProps) {
  const [ranking] = useState<GrupoRanking[]>(initialRanking);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAlianza, setSelectedAlianza] = useState<GrupoRanking | null>(null);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    // Si el evento finalizó, no necesitamos suscribirnos (ahorramos conexiones)
    if (eventoFinalizado) return;

    // TODO: En Fase 4 (Realtime robusto), idealmente el servidor envía un 'payload' 
    // y hacemos un re-fetch a una API route pequeña para traer el nuevo ranking ya sumado.
    // Opcionalmente podemos usar router.refresh() de Next.js si envolvemos esto inteligentemente.
    // Por ahora dejaremos el esqueleto Realtime que escucha la tabla puntajes.

    const channel = supabase
      .channel(`puntajes_evento_${eventoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "puntajes",
          filter: `evento_id=eq.${eventoId}`,
        },
        async () => {
          // Si el cambio es sobre un puntaje público (o pasó de publico a privado)
          // Hacemos un soft refresh del ranking.
          // Como la suma es compleja (SQL), lo ideal es llamar a una API route:
          // const res = await fetch(`/api/eventos/${eventoId}/ranking`);
          // const newRanking = await res.json();
          // setRanking(newRanking);
          
          setIsUpdating(true);
          // Por brevedad y para evitar refetch completos, forzamos recarga de página (Fallback rápido)
          // En versión final optimizada, re-fetcheremos el array JSON.
          window.location.reload(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, eventoFinalizado, supabase]);

  if (ranking.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-[3px] border-dashed border-border/50 rounded-3xl bg-card">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Trophy className="size-8 text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-foreground">El ranking está vacío</h3>
        <p className="text-muted-foreground mt-2 text-sm max-w-sm">
          Aún no hay resultados públicos para este evento. ¡Vuelve más tarde cuando comiencen las competencias!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Indicador de actualización (para cuando implementemos el fetch local) */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-200 shadow-sm flex items-center gap-2 z-10"
          >
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Actualizando...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {ranking.map((grupo, index) => {
          const isTop3 = index < 3;
          
          // Estilos según posición
          let cardStyle = "border-border bg-card";
          let numStyle = "bg-muted text-muted-foreground";
          let icon = null;

          if (index === 0) {
            cardStyle = "border-yellow-400 bg-yellow-50/50";
            numStyle = "bg-yellow-400 text-yellow-900";
            icon = <Medal className="size-5 text-yellow-600 drop-shadow-sm" />;
          } else if (index === 1) {
            cardStyle = "border-slate-300 bg-slate-50/50";
            numStyle = "bg-slate-300 text-slate-800";
            icon = <Medal className="size-5 text-slate-500 drop-shadow-sm" />;
          } else if (index === 2) {
            cardStyle = "border-amber-600/50 bg-amber-50/30";
            numStyle = "bg-amber-600 text-white";
            icon = <Medal className="size-5 text-amber-700 drop-shadow-sm" />;
          }

          return (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              key={grupo.id}
              onClick={() => setSelectedAlianza(grupo)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-[3px] shadow-clay-sm relative overflow-hidden cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all ${cardStyle}`}
            >
              {/* Barra de color lateral opcional */}
              {grupo.color && (
                <div 
                  className="absolute left-0 top-0 bottom-0 w-2.5" 
                  style={{ backgroundColor: grupo.color }}
                />
              )}

              {/* Posición */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ml-1 shrink-0 ${numStyle}`}>
                {index + 1}
              </div>

              {/* Info Grupo */}
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-bold text-lg md:text-xl text-foreground truncate leading-tight flex items-center gap-2">
                  {grupo.nombre}
                  {isTop3 && icon}
                </h3>
              </div>

              {/* Puntaje */}
              <div className="flex flex-col items-end shrink-0">
                <div className="text-3xl md:text-4xl font-black font-heading tracking-tighter text-foreground drop-shadow-sm">
                  {grupo.puntajeTotal.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1">
                  Puntos
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedAlianza && (
        <AlianzaDetalleModal
          eventoId={eventoId}
          grupoId={selectedAlianza.id}
          grupoNombre={selectedAlianza.nombre}
          grupoColor={selectedAlianza.color}
          open={!!selectedAlianza}
          onOpenChange={(val) => {
            if (!val) setSelectedAlianza(null);
          }}
        />
      )}
    </div>
  );
}
