"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { eliminarActividad } from "../actions";
import { ActividadForm } from "./ActividadForm";
import type { Actividad } from "../types";
import type { Escala } from "@/features/escalas/types";

interface ActividadItemProps {
  actividad: Actividad;
  eventoId: string;
  escalasDisponibles: Escala[];
}

export function ActividadItem({ actividad, eventoId, escalasDisponibles }: ActividadItemProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleEliminar() {
    const result = await eliminarActividad(actividad.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Actividad eliminada");
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar actividad</DialogTitle>
          </DialogHeader>
          <ActividadForm
            eventoId={eventoId}
            actividad={actividad}
            escalasDisponibles={escalasDisponibles}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &ldquo;{actividad.nombre}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. No se podrá eliminar si ya hay puntajes asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-clay shadow-clay-sm"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <li className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border-[3px] border-border bg-card px-4 py-3 shadow-clay transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-hover">
        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold leading-tight">{actividad.nombre}</span>
            {actividad.escala && (
              <Badge variant="secondary" className="font-mono text-[10px] bg-secondary/20 text-secondary-foreground border border-secondary/40 shrink-0">
                {actividad.escala.nombre}
              </Badge>
            )}
          </div>
          {(actividad.descripcion || actividad.reglas) && (
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {actividad.descripcion || "Ver reglas..."}
            </p>
          )}
        </div>

        <div className="flex justify-end sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Acciones para ${actividad.nombre}`}
                  className="shrink-0 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44 border-[3px] border-border shadow-clay-sm">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-3.5" aria-hidden />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive font-medium"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </li>
    </>
  );
}
