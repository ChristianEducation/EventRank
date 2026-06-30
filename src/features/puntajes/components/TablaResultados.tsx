"use client";

import { useState } from "react";
import { Eye, EyeOff, MoreHorizontal, Pencil, Trophy, Star } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PuntajeForm } from "./PuntajeForm";
import { toggleVisibilidad } from "../actions";
import type { Puntaje } from "../types";
import type { Grupo } from "@/features/grupos/types";
import type { Actividad } from "@/features/actividades/types";

interface TablaResultadosProps {
  puntajes: Puntaje[];
  grupos: Grupo[];
  actividades: Actividad[];
}

export function TablaResultados({ puntajes, grupos, actividades }: TablaResultadosProps) {
  const router = useRouter();
  const [editingPuntaje, setEditingPuntaje] = useState<Puntaje | null>(null);

  if (puntajes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-border/50 py-12 text-center text-muted-foreground">
        <Trophy className="size-10 opacity-20 mb-3" />
        <p className="font-medium">No hay puntajes registrados.</p>
        <p className="text-sm">Registra resultados para que los grupos sumen puntos.</p>
      </div>
    );
  }

  async function handleToggle(id: string, current: boolean) {
    const res = await toggleVisibilidad(id, !current);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success(!current ? "Puntaje publicado" : "Puntaje ocultado");
      router.refresh();
    }
  }

  return (
    <>
      <Dialog open={!!editingPuntaje} onOpenChange={(val) => !val && setEditingPuntaje(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar resultado</DialogTitle>
          </DialogHeader>
          {editingPuntaje && (
            <PuntajeForm
              puntaje={editingPuntaje}
              grupos={grupos}
              actividades={actividades}
              onSuccess={() => setEditingPuntaje(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border-[3px] border-border bg-card overflow-hidden shadow-clay">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b-[3px] border-border uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Grupo / Actividad</th>
                <th className="px-4 py-3 text-center">Lugar</th>
                <th className="px-4 py-3 text-center">Modificadores</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-[3px] divide-border/30">
              {puntajes.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <div 
                          className="size-2.5 rounded-full border border-border" 
                          style={{ backgroundColor: p.grupo?.color || "#ccc" }} 
                        />
                        {p.grupo?.nombre}
                      </div>
                      <span className="text-xs text-muted-foreground">{p.actividad?.nombre}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-center font-bold text-lg">
                    {p.lugar}°
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {p.comodin && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50 text-[10px] px-1.5 h-5 flex items-center gap-1">
                          <Star className="size-3" /> x2
                        </Badge>
                      )}
                      {p.bonificacion > 0 && (
                        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 text-[10px] px-1.5 h-5">
                          +{p.bonificacion}
                        </Badge>
                      )}
                      {p.sancion > 0 && (
                        <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 text-[10px] px-1.5 h-5">
                          -{p.sancion}
                        </Badge>
                      )}
                      {!p.comodin && p.bonificacion === 0 && p.sancion === 0 && (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center font-black text-xl text-primary">
                    {p.puntajeFinal}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggle(p.id, p.publico)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border-2 transition-colors ${
                        p.publico 
                          ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" 
                          : "bg-muted text-muted-foreground border-border/50 hover:bg-muted/80"
                      }`}
                    >
                      {p.publico ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      {p.publico ? "Público" : "Privado"}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="border-[3px] border-border shadow-clay-sm">
                        <DropdownMenuItem onClick={() => setEditingPuntaje(p)}>
                          <Pencil className="size-3.5 mr-2" />
                          Editar y recalcular
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
