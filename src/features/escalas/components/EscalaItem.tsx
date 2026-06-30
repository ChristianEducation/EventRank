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

import { eliminarEscala } from "../actions";
import { EscalaForm } from "./EscalaForm";
import type { Escala } from "../types";

interface EscalaItemProps {
  escala: Escala;
  eventoId: string;
}

export function EscalaItem({ escala, eventoId }: EscalaItemProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Ordenar y tomar los primeros 5 puntajes para el preview
  const previewPuntajes = Object.entries(escala.puntajes)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .slice(0, 5);
  const totalLugares = Object.keys(escala.puntajes).length;

  async function handleEliminar() {
    const result = await eliminarEscala(escala.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Escala eliminada");
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar escala</DialogTitle>
          </DialogHeader>
          <EscalaForm
            eventoId={eventoId}
            escala={escala}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &ldquo;{escala.nombre}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. Si la escala está en uso por alguna actividad del evento, no se podrá eliminar.
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

      {/* Fila de la escala */}
      <li className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border-[3px] border-border bg-card px-4 py-3 shadow-clay transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-hover">
        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
          <span className="truncate font-semibold leading-tight">{escala.nombre}</span>
          
          {/* Preview de puntajes */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {previewPuntajes.map(([lugar, puntos]) => (
              <Badge key={lugar} variant="secondary" className="border-border border-2 font-mono bg-muted text-muted-foreground hover:bg-muted">
                {lugar}°: {puntos}
              </Badge>
            ))}
            {totalLugares > 5 && (
              <span className="text-xs font-medium text-muted-foreground ml-1">
                +{totalLugares - 5} más
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Acciones para ${escala.nombre}`}
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
