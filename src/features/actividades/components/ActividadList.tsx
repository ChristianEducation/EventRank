"use client";

import { useState } from "react";
import { Plus, Swords, FileSpreadsheet, Search, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hasEscalas = escalasDisponibles.length > 0;

  const filteredActividades = actividades.filter(a => 
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredActividades.length / itemsPerPage);
  const currentActividades = filteredActividades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

      {/* Buscador */}
      {actividades.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar actividad..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-card border-[3px] border-border shadow-clay-sm"
          />
        </div>
      )}

      {/* Lista o empty state */}
      {actividades.length === 0 ? (
        <EmptyState onNuevo={() => setNuevoOpen(true)} canCreate={hasEscalas} />
      ) : filteredActividades.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No se encontraron actividades con &quot;{searchTerm}&quot;
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3" aria-label="Lista de actividades">
            {currentActividades.map((actividad) => (
              <ActividadItem 
                key={actividad.id} 
                actividad={actividad} 
                eventoId={eventoId} 
                escalasDisponibles={escalasDisponibles} 
              />
            ))}
          </ul>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 border-[3px] border-border rounded-2xl bg-card px-4 py-2 shadow-clay-sm">
              <span className="text-sm text-muted-foreground font-medium">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon-sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-2 border-transparent"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon-sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-2 border-transparent"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
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
