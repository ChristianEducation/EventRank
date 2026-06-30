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

  return (
    <div className="flex flex-col gap-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 p-3 rounded-2xl border-[3px] border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground min-w-fit">Filtro:</span>
          <Select value={filtroActividad} onValueChange={(val) => setFiltroActividad(val || "all")}>
            <SelectTrigger className="w-[200px] border-clay bg-card h-9">
              <SelectValue placeholder="Todas las actividades" />
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
      <TablaResultados puntajes={puntajesFiltrados} grupos={grupos} actividades={actividades} />
    </div>
  );
}
