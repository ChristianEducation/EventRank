"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toggleVisibilidadActividad } from "../actions";

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
  const [filtroActividad, setFiltroActividad] = useState<string>("all");
  const router = useRouter();

  const handleTogglePublico = async (actividadId: string, newState: boolean) => {
    const res = await toggleVisibilidadActividad(actividadId, newState);
    if (res.success) {
      toast.success(`Resultados ${newState ? "publicados" : "ocultados"} exitosamente.`);
      router.refresh();
    } else {
      toast.error(res.error || "Ocurrió un error");
    }
  };

  const canCreate = grupos.length > 0 && actividades.length > 0;
  const selectedActividad = actividades.find((a) => a.id === filtroActividad);

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [actividadDetalle, setActividadDetalle] = useState<Actividad | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [actividadForm, setActividadForm] = useState<Actividad | null>(null);

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
      </div>

      {!canCreate && (
        <div className="rounded-2xl border-[3px] border-destructive bg-destructive/10 px-4 py-3 shadow-clay-sm text-sm">
          <p className="font-semibold text-destructive">Faltan datos requeridos</p>
          <p className="text-destructive/90 mt-0.5">Debes crear al menos un grupo y una actividad (competencia) antes de ingresar resultados.</p>
        </div>
      )}

      {/* Lista / Tabla */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {(filtroActividad === "all" ? actividades : actividades.filter(a => a.id === filtroActividad)).map(act => {
          const pts = puntajes.filter(p => p.actividadId === act.id);
          const isPublic = pts.some(p => p.publico);
          
          return (
            <div key={act.id} className="bg-card border-[3px] border-border/50 rounded-2xl p-4 shadow-clay-sm flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-lg line-clamp-2">{act.nombre}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <Label htmlFor={`publico-${act.id}`} className="text-[10px] font-bold uppercase cursor-pointer text-muted-foreground">
                      {isPublic ? "Público" : "Privado"}
                    </Label>
                    <Switch 
                      id={`publico-${act.id}`}
                      checked={isPublic} 
                      onCheckedChange={(checked) => handleTogglePublico(act.id, checked)}
                      className="data-[state=checked]:bg-green-500 scale-75 origin-right"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pts.length > 0 ? `${pts.length} alianzas calificadas` : "Sin calificar"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="w-full font-bold border-[3px] border-border/50 shadow-clay-sm bg-background"
                  onClick={() => {
                    setActividadDetalle(act);
                    setDetalleOpen(true);
                  }}
                  disabled={pts.length === 0}
                >
                  Ver detalles de lugares
                </Button>
                <Button 
                  variant="default" 
                  className="w-full font-bold shadow-clay-sm"
                  onClick={() => {
                    setActividadForm(act);
                    setFormOpen(true);
                  }}
                >
                  Administrar Resultados
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detalles */}
      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-[3px] border-border shadow-clay mx-4 w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>{actividadDetalle?.nombre} - Detalles</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <TablaResultados 
              puntajes={puntajes.filter(p => p.actividadId === actividadDetalle?.id)} 
              grupos={grupos} 
              actividades={actividades} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Formulario */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Administrar resultados: {actividadForm?.nombre}</DialogTitle>
          </DialogHeader>
          {actividadForm && (
            <BulkPuntajeForm 
              actividadId={actividadForm.id}
              actividad={actividadForm}
              grupos={grupos}
              puntajesActuales={puntajes.filter(p => p.actividadId === actividadForm.id)}
              onSuccess={() => setFormOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
