"use client";

import { useState } from "react";
import { Plus, Swords, FileSpreadsheet } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { ActividadForm } from "./ActividadForm";
import { ActividadItem } from "./ActividadItem";
import { CargaMasivaActividades } from "./CargaMasivaActividades";
import type { Actividad } from "../types";
import type { Escala } from "@/features/escalas/types";

interface ActividadListProps {
  actividades: Actividad[];
  escalasDisponibles: Escala[];
  eventoId: string;
}

export function ActividadList({ actividades, escalasDisponibles, eventoId }: ActividadListProps) {
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [cargaMasivaOpen, setCargaMasivaOpen] = useState(false);

  const hasEscalas = escalasDisponibles.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header con contador y CTAs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl border-[3px] border-border bg-primary/10 shadow-clay-sm">
            <Swords className="size-4 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">
              {actividades.length === 0
                ? "Sin actividades"
                : `${actividades.length} actividad${actividades.length !== 1 ? "es" : ""}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={cargaMasivaOpen} onOpenChange={setCargaMasivaOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm" className="gap-1.5 font-bold border-clay shadow-clay-sm bg-card hidden sm:flex">
                  <FileSpreadsheet className="size-4" aria-hidden />
                  Carga Masiva
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Importar Actividades</DialogTitle>
              </DialogHeader>
              <CargaMasivaActividades eventoId={eventoId} onSuccess={() => setCargaMasivaOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5 font-bold border-clay shadow-clay-sm" disabled={!hasEscalas}>
                  <Plus className="size-4" aria-hidden />
                  Nueva
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva actividad</DialogTitle>
              </DialogHeader>
              <ActividadForm 
                eventoId={eventoId} 
                escalasDisponibles={escalasDisponibles} 
                onSuccess={() => setNuevoOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!hasEscalas && (
        <div className="rounded-2xl border-[3px] border-destructive bg-destructive/10 px-4 py-3 shadow-clay-sm text-sm">
          <p className="font-semibold text-destructive">Faltan escalas de puntuación</p>
          <p className="text-destructive/90 mt-0.5">Debes crear al menos una escala antes de poder crear actividades.</p>
        </div>
      )}

      {/* Lista o empty state */}
      {actividades.length === 0 ? (
        <EmptyState onNuevo={() => setNuevoOpen(true)} canCreate={hasEscalas} />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Lista de actividades">
          {actividades.map((actividad) => (
            <ActividadItem 
              key={actividad.id} 
              actividad={actividad} 
              eventoId={eventoId} 
              escalasDisponibles={escalasDisponibles} 
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({ onNuevo, canCreate }: { onNuevo: () => void, canCreate: boolean }) {
  return (
    <button
      type="button"
      onClick={onNuevo}
      disabled={!canCreate}
      className="group flex flex-col items-center gap-3 rounded-2xl border-[3px] border-dashed border-border/50 bg-muted/30 px-6 py-10 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl border-[3px] border-border bg-primary/10 shadow-clay-sm transition-transform group-hover:scale-110">
        <Plus className="size-5 text-primary" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-foreground">Crear primera competencia</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Agrega las actividades donde los grupos podrán competir.
        </p>
      </div>
    </button>
  );
}
