"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
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

import { eliminarGrupo, desactivarGrupo } from "../actions";
import { GrupoForm } from "./GrupoForm";
import type { Grupo } from "../types";

interface GrupoItemProps {
  grupo: Grupo;
  eventoId: string;
  index: number;
}

export function GrupoItem({ grupo, eventoId, index }: GrupoItemProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cargandoDesactivar, setCargandoDesactivar] = useState(false);

  async function handleEliminar() {
    const result = await eliminarGrupo(grupo.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Grupo eliminado");
    setDeleteOpen(false);
    router.refresh();
  }

  async function handleDesactivar() {
    setCargandoDesactivar(true);
    const result = await desactivarGrupo(grupo.id);
    setCargandoDesactivar(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Grupo desactivado");
    router.refresh();
  }

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar grupo</DialogTitle>
          </DialogHeader>
          <GrupoForm
            eventoId={eventoId}
            grupo={grupo}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &ldquo;{grupo.nombre}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. Si el grupo tiene puntajes registrados no podrá
              eliminarse — en ese caso usa &ldquo;Desactivar&rdquo; para ocultarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fila del grupo */}
      <li className="group flex items-center gap-4 rounded-2xl border-[3px] border-border bg-card px-4 py-3 shadow-clay transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-hover">
        {/* Posición */}
        <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
          {index + 1}
        </span>

        {/* Swatch de color — más grande, con ring al hacer hover */}
        <span
          className="size-11 shrink-0 rounded-full border-[3px] border-border shadow-clay-sm transition-transform group-hover:scale-110"
          style={
            grupo.color
              ? { backgroundColor: grupo.color, borderColor: grupo.color }
              : undefined
          }
          aria-label={grupo.color ? `Color ${grupo.color}` : "Sin color asignado"}
          role="img"
        />

        {/* Info */}
        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <span className="truncate font-semibold leading-tight">{grupo.nombre}</span>
          {grupo.color && (
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {grupo.color}
            </span>
          )}
        </div>

        {/* Menú de acciones — dropdown para no saturar la fila */}
        <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Acciones para ${grupo.nombre}`}
                  className="shrink-0 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              }
            />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" aria-hidden />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDesactivar}
              disabled={cargandoDesactivar}
            >
              {grupo.activo ? (
                <><EyeOff className="size-3.5" aria-hidden /> Desactivar</>
              ) : (
                <><Eye className="size-3.5" aria-hidden /> Activar</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </>
  );
}
