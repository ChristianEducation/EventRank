"use client";

import { useState, useMemo } from "react";
import { Search, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ResultadoPublico {
  actividadId: string;
  actividadNombre: string;
  grupoId: string;
  grupoNombre: string;
  grupoColor: string | null;
  lugar: number;
  puntajeFinal: number;
}

interface BuscadorResultadosProps {
  resultadosRaw: ResultadoPublico[];
}

export function BuscadorResultados({ resultadosRaw }: BuscadorResultadosProps) {
  const [query, setQuery] = useState("");

  // Agrupar resultados por actividad
  const actividadesMap = useMemo(() => {
    const map = new Map<string, { nombre: string; resultados: ResultadoPublico[] }>();
    for (const r of resultadosRaw) {
      if (!map.has(r.actividadId)) {
        map.set(r.actividadId, { nombre: r.actividadNombre, resultados: [] });
      }
      map.get(r.actividadId)!.resultados.push(r);
    }
    // Ordenar resultados internos por lugar
    for (const act of map.values()) {
      act.resultados.sort((a, b) => a.lugar - b.lugar);
    }
    return Array.from(map.entries());
  }, [resultadosRaw]);

  // Filtrar por búsqueda
  const actividadesFiltradas = useMemo(() => {
    if (!query.trim()) return actividadesMap;
    const lowerQ = query.toLowerCase();
    return actividadesMap.filter(([, act]) =>
      act.nombre.toLowerCase().includes(lowerQ)
    );
  }, [actividadesMap, query]);

  if (actividadesMap.length === 0) {
    return null; // Si no hay resultados publicados, no mostramos el buscador
  }

  const getLugarColor = (lugar: number) => {
    if (lugar === 1) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (lugar === 2) return "text-slate-600 bg-slate-100 border-slate-200";
    if (lugar === 3) return "text-amber-800 bg-amber-100 border-amber-200";
    return "text-muted-foreground bg-muted border-border";
  };

  return (
    <div className="flex flex-col gap-4 mt-12 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Search className="size-5" />
          Buscador de Resultados
        </h3>
        <p className="text-sm text-muted-foreground">
          Encuentra los lugares obtenidos en las diferentes actividades y competencias.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar actividad por nombre..."
          className="pl-9 border-[3px] border-border shadow-clay-sm h-11 text-base rounded-2xl bg-card focus-visible:ring-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-card border-[3px] border-border shadow-clay rounded-3xl p-2 sm:p-4 mt-2">
        {actividadesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Trophy className="size-10 opacity-20 mb-3" />
            <p className="font-medium">No se encontraron actividades</p>
            <p className="text-sm">Prueba buscando con otro término.</p>
          </div>
        ) : (
          <Accordion className="w-full space-y-2">
            {actividadesFiltradas.map(([id, act]) => (
              <AccordionItem 
                key={id} 
                value={id} 
                className="border-2 border-border/50 rounded-2xl px-4 overflow-hidden bg-background data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="font-bold text-left text-[15px] leading-tight pr-4">
                    {act.nombre}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 pt-2 pb-4">
                    {act.resultados.map((res) => (
                      <div 
                        key={`${res.actividadId}-${res.grupoId}`}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-lg border font-bold text-sm shadow-sm ${getLugarColor(res.lugar)}`}>
                            {res.lugar}°
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full shadow-sm" 
                              style={{ backgroundColor: res.grupoColor || "var(--muted)" }}
                            />
                            <span className="font-semibold leading-tight">{res.grupoNombre}</span>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-muted-foreground whitespace-nowrap">
                          {res.puntajeFinal.toLocaleString()} <span className="text-[10px] font-sans uppercase">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
