"use client";

import { useState } from "react";
import { BookOpen, Eye, EyeOff, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { BaseForm } from "./BaseForm";
import { eliminarBase, toggleVisibleBase } from "../actions";
import type { Base } from "../types";

interface BaseListProps {
  eventoId: string;
  bases: Base[];
}

export function BaseList({ eventoId, bases }: BaseListProps) {
  const router = useRouter();
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Base | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deletingId) return;
    const res = await eliminarBase(deletingId);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success("Sección eliminada del reglamento");
      router.refresh();
    }
    setDeletingId(null);
  }

  async function handleToggle(id: string, current: boolean) {
    const res = await toggleVisibleBase(id, !current);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success(!current ? "Sección visible en el portal" : "Sección ocultada");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nueva regla / sección</DialogTitle></DialogHeader>
          <BaseForm eventoId={eventoId} onSuccess={() => { setNuevoOpen(false); router.refresh(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(v) => !v && setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar sección</DialogTitle></DialogHeader>
          {editingItem && (
            <BaseForm eventoId={eventoId} base={editingItem} onSuccess={() => { setEditingItem(null); router.refresh(); }} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar del reglamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-end">
        <Button onClick={() => setNuevoOpen(true)} className="gap-2 font-bold border-clay shadow-clay-sm">
          <Plus className="size-4" /> Agregar Sección
        </Button>
      </div>

      {bases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-border/50 py-16 text-center text-muted-foreground">
          <BookOpen className="size-12 opacity-20 mb-4" />
          <p className="font-medium">El reglamento está vacío</p>
          <p className="text-sm">Sube las bases para que los participantes puedan consultarlas.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bases.map((b) => (
            <div key={b.id} className={`flex flex-col gap-3 rounded-2xl border-[3px] border-border bg-card p-5 transition-transform hover:-translate-y-1 ${!b.visible ? "opacity-60" : "shadow-clay-sm"}`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5 h-5 flex items-center justify-center bg-muted rounded-full">{b.orden}</span>
                    <h4 className="font-bold text-lg text-foreground leading-tight">{b.titulo}</h4>
                  </div>
                  {b.categoria && <Badge variant="secondary" className="w-fit mt-1">{b.categoria}</Badge>}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 shrink-0 border-2 border-transparent">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="border-[3px] border-border shadow-clay-sm">
                    <DropdownMenuItem onSelect={() => handleToggle(b.id, b.visible)}>
                      {b.visible ? <><EyeOff className="size-3.5 mr-2" /> Ocultar del portal</> : <><Eye className="size-3.5 mr-2" /> Hacer visible</>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setEditingItem(b)}><Pencil className="size-3.5 mr-2" /> Editar</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDeletingId(b.id)} className="text-destructive"><Trash2 className="size-3.5 mr-2" /> Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-sm text-muted-foreground mt-2 line-clamp-4 whitespace-pre-wrap">
                {b.contenido}
              </div>

              {!b.visible && (
                <div className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit border border-amber-200 flex items-center gap-1.5">
                  <EyeOff className="size-3" /> Privado
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
