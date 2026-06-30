"use client";

import { useState } from "react";
import { CalendarDays, Clock, MapPin, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
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

import { HorarioForm } from "./HorarioForm";
import { eliminarHorario } from "../actions";
import type { Horario } from "../types";

interface HorarioListProps {
  eventoId: string;
  horarios: Horario[];
}

export function HorarioList({ eventoId, horarios }: HorarioListProps) {
  const router = useRouter();
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Horario | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Agrupar por fecha
  const grouped = horarios.reduce((acc, curr) => {
    const key = curr.fecha;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, Horario[]>);

  const dates = Object.keys(grouped).sort();

  async function handleDelete() {
    if (!deletingId) return;
    const res = await eliminarHorario(deletingId);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success("Eliminado de la agenda");
      router.refresh();
    }
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Modales */}
      <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo ítem de agenda</DialogTitle></DialogHeader>
          <HorarioForm eventoId={eventoId} onSuccess={() => { setNuevoOpen(false); router.refresh(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(v) => !v && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar horario</DialogTitle></DialogHeader>
          {editingItem && (
            <HorarioForm eventoId={eventoId} horario={editingItem} onSuccess={() => { setEditingItem(null); router.refresh(); }} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar de la agenda?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer y el público ya no verá esta actividad.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex justify-end">
        <Button onClick={() => setNuevoOpen(true)} className="gap-2 font-bold border-clay shadow-clay-sm">
          <Plus className="size-4" /> Agregar Actividad
        </Button>
      </div>

      {/* Lista Agrupada */}
      {dates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-border/50 py-16 text-center text-muted-foreground">
          <CalendarDays className="size-12 opacity-20 mb-4" />
          <p className="font-medium">La agenda está vacía</p>
          <p className="text-sm">Agrega las actividades para que los participantes sepan qué toca.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {dates.map((dateKey) => {
            const items = grouped[dateKey];
            const dateStr = format(parseISO(dateKey), "EEEE d 'de' MMMM", { locale: es });
            return (
              <div key={dateKey} className="flex flex-col gap-4">
                <h3 className="text-lg font-bold capitalize text-primary border-b-[3px] border-primary/20 pb-2 flex items-center gap-2">
                  <CalendarDays className="size-5" /> {dateStr}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((h) => (
                    <div key={h.id} className="flex flex-col rounded-2xl border-[3px] border-border bg-card p-4 shadow-clay-sm transition-transform hover:-translate-y-1">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-bold text-foreground leading-tight line-clamp-2">{h.nombreActividad}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 shrink-0">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="border-[3px] border-border shadow-clay-sm">
                            <DropdownMenuItem onSelect={() => setEditingItem(h)}><Pencil className="size-3.5 mr-2" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setDeletingId(h.id)} className="text-destructive"><Trash2 className="size-3.5 mr-2" /> Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 mt-auto text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-orange-500" />
                          <span>{h.horaInicio.slice(0,5)} {h.horaFin ? `- ${h.horaFin.slice(0,5)}` : ""}</span>
                        </div>
                        {h.lugar && (
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-blue-500" />
                            <span className="truncate">{h.lugar}</span>
                          </div>
                        )}
                        {h.jornada && (
                          <div className="mt-1 inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-bold capitalize text-foreground border border-border/50">
                            Jornada: {h.jornada}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
