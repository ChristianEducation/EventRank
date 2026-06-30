"use client";

import { useState } from "react";
import { CheckSquare } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BulkPuntajeForm } from "./BulkPuntajeForm";
import { TablaResultados } from "./TablaResultados";
import type { Puntaje } from "../types";
import type { Grupo } from "@/features/grupos/types";
import type { Actividad } from "@/features/actividades/types";

interface PuntajesListProps {
  puntajes: Puntaje[];
  grupos: Grupo[];
  actividades: Actividad[];
}

export function PuntajesList({ puntajes, grupos, actividades }: PuntajesListProps) {
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [filtroActividad, setFiltroActividad] = useState<string>("all");

  const canCreate = grupos.length > 0 && actividades.length > 0;
  const selectedActividad = actividades.find((a) => a.id === filtroActividad);

  // Filtrado local
  const puntajesFiltrados = filtroActividad === "all" 
    ? puntajes 
    : puntajes.filter(p => p.actividadId === filtroActividad);

  const actividadesConPuntajes = actividades.filter(a => 
    puntajes.some(p => p.actividadId === a.id)
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 p-3 rounded-2xl border-[3px] border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground min-w-fit">Filtro:</span>
          <Select value={filtroActividad} onValueChange={(val) => setFiltroActividad(val || "all")}>
            <SelectTrigger className="w-[200px] border-clay bg-card h-9">
              <SelectValue>
                {selectedActividad?.nombre || "Todas las actividades"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-[3px] border-border shadow-clay-sm">
              <SelectItem value="all">Ver todas las competencias</SelectItem>
              {actividades.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
          <DialogTrigger
            render={
              <Button 
                size="sm" 
                className="gap-1.5 font-bold border-clay shadow-clay-sm" 
                disabled={!canCreate || !selectedActividad}
                onClick={(e) => {
                  if (!selectedActividad) {
                    e.preventDefault();
                    alert("Por favor selecciona una actividad en el filtro para registrar sus resultados.");
                  }
                }}
              >
                <CheckSquare className="size-4" />
                Ingresar Resultados
              </Button>
            }
          />
          <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Registrar resultados masivos</DialogTitle>
            </DialogHeader>
            {selectedActividad && (
              <BulkPuntajeForm 
                actividadId={selectedActividad.id}
                actividad={selectedActividad}
                grupos={grupos}
                puntajesActuales={puntajesFiltrados}
                onSuccess={() => setNuevoOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {!canCreate && (
        <div className="rounded-2xl border-[3px] border-destructive bg-destructive/10 px-4 py-3 shadow-clay-sm text-sm">
          <p className="font-semibold text-destructive">Faltan datos requeridos</p>
          <p className="text-destructive/90 mt-0.5">Debes crear al menos un grupo y una actividad (competencia) antes de ingresar resultados.</p>
        </div>
      )}

      {/* Lista / Tabla */}
      {filtroActividad === "all" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {actividadesConPuntajes.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <p className="font-medium">Aún no hay puntajes ingresados.</p>
              <p className="text-sm">Selecciona una actividad en el filtro superior para comenzar.</p>
            </div>
          ) : (
            actividadesConPuntajes.map(act => {
              const pts = puntajes.filter(p => p.actividadId === act.id);
              const isPublic = pts.some(p => p.publico);
              
              return (
                <div key={act.id} className="bg-card border-[3px] border-border/50 rounded-2xl p-4 shadow-clay-sm flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg line-clamp-2">{act.nombre}</h3>
                      {isPublic ? (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase shrink-0">Público</span>
                      ) : (
                        <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-1 rounded-full uppercase shrink-0">Privado</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pts.length} alianzas calificadas
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full font-bold border-[3px] border-border/50 shadow-clay-sm bg-background"
                    onClick={() => setFiltroActividad(act.id)}
                  >
                    Ver detalles de lugares
                  </Button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border-2 border-border/50">
            <h2 className="font-bold text-lg">{selectedActividad?.nombre}</h2>
            <Button 
              variant="ghost" 
              size="sm"
              className="font-bold text-muted-foreground hover:text-foreground"
              onClick={() => setFiltroActividad("all")}
            >
              Volver a todas
            </Button>
          </div>
          <TablaResultados puntajes={puntajesFiltrados} grupos={grupos} actividades={actividades} />
        </div>
      )}
    </div>
  );
}
