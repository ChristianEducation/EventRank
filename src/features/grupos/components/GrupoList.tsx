"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { GrupoForm } from "./GrupoForm";
import { GrupoItem } from "./GrupoItem";
import type { Grupo } from "../types";

interface GrupoListProps {
  grupos: Grupo[];
  eventoId: string;
}

export function GrupoList({ grupos, eventoId }: GrupoListProps) {
  const [nuevoOpen, setNuevoOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Header con contador y CTA */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl border-[3px] border-border bg-primary/10 shadow-clay-sm">
            <Users className="size-4 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">
              {grupos.length === 0
                ? "Sin grupos"
                : `${grupos.length} grupo${grupos.length !== 1 ? "s" : ""}`}
            </p>
            <p className="text-xs text-muted-foreground">ordenados por posición</p>
          </div>
        </div>

        <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5 font-medium">
                <Plus className="size-4" aria-hidden />
                Nuevo grupo
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo grupo</DialogTitle>
            </DialogHeader>
            <GrupoForm eventoId={eventoId} onSuccess={() => setNuevoOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista o empty state */}
      {grupos.length === 0 ? (
        <EmptyState onNuevo={() => setNuevoOpen(true)} />
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Lista de grupos">
          {grupos.map((grupo, i) => (
            <GrupoItem key={grupo.id} grupo={grupo} eventoId={eventoId} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({ onNuevo }: { onNuevo: () => void }) {
  return (
    <button
      type="button"
      onClick={onNuevo}
      className="group flex flex-col items-center gap-3 rounded-2xl border-[3px] border-dashed border-border/50 bg-muted/30 px-6 py-10 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl border-[3px] border-border bg-primary/10 shadow-clay-sm transition-transform group-hover:scale-110">
        <Plus className="size-5 text-primary" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-foreground">Crear primer grupo</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Añade los grupos o alianzas que van a competir en este evento.
        </p>
      </div>
    </button>
  );
}
