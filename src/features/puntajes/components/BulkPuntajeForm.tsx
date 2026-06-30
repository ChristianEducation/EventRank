"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { bulkPuntajesSchema, type BulkPuntajesInput } from "../schemas";
import { registrarPuntajesMasivos } from "../actions";
import type { Grupo } from "@/features/grupos/types";
import type { Actividad } from "@/features/actividades/types";
import type { Puntaje } from "../types";

interface BulkPuntajeFormProps {
  actividadId: string;
  grupos: Grupo[];
  actividad: Actividad;
  puntajesActuales: Puntaje[];
  onSuccess: () => void;
}

export function BulkPuntajeForm({
  actividadId,
  grupos,
  actividad,
  puntajesActuales,
  onSuccess,
}: BulkPuntajeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mapeamos los puntajes actuales para prellenar el formulario
  const defaultValues: BulkPuntajesInput = {
    actividadId,
    resultados: grupos.map((g) => {
      const p = puntajesActuales.find((p) => p.grupoId === g.id && p.actividadId === actividadId);
      return {
        grupoId: g.id,
        lugar: p?.lugar ?? null,
        comodin: p?.comodin ?? false,
        sancion: p?.sancion ?? 0,
      };
    }),
  };

  const form = useForm<BulkPuntajesInput>({
    resolver: zodResolver(bulkPuntajesSchema) as any,
    defaultValues,
  });

  const { control, handleSubmit, watch, setValue } = form;
  const { fields } = useFieldArray({
    control,
    name: "resultados",
  });

  const watchResultados = watch("resultados");

  async function onSubmit(data: BulkPuntajesInput) {
    setIsSubmitting(true);
    const result = await registrarPuntajesMasivos(data);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Resultados registrados exitosamente");
      onSuccess();
    }
  }

  // Opciones de lugares del 1 al N grupos
  const opcionesLugar = Array.from({ length: grupos.length }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col gap-1">
        <h3 className="font-bold text-lg text-primary">{actividad.nombre}</h3>
        <p className="text-sm text-muted-foreground">Asigna los lugares obtenidos por cada alianza.</p>
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const grupo = grupos.find((g) => g.id === field.grupoId)!;
          const currentComodin = watchResultados[index]?.comodin;

          return (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border-[3px] border-border bg-card"
            >
              <div className="flex items-center gap-3 w-48 shrink-0">
                <div
                  className="size-4 rounded-full border border-border"
                  style={{ backgroundColor: grupo.color || "#ccc" }}
                />
                <span className="font-bold text-base">{grupo.nombre}</span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Lugar</Label>
                  <Controller
                    control={control}
                    name={`resultados.${index}.lugar`}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value ? value.toString() : ""}
                        onValueChange={(val) => onChange(val ? Number(val) : "")}
                      >
                        <SelectTrigger className="w-24 border-clay h-9">
                          <SelectValue placeholder="N/A" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0" className="text-muted-foreground italic">N/A</SelectItem>
                          {opcionesLugar.map((n) => {
                            // Permitimos elegir si está libre, O si ya es el valor seleccionado por este mismo grupo
                            const isSelectedByOther = watchResultados.some(
                              (r, i) => i !== index && r.lugar === n
                            );
                            return (
                              <SelectItem key={n} value={n.toString()} disabled={isSelectedByOther}>
                                {n}° Lugar
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Comodín</Label>
                  <Button
                    type="button"
                    variant={currentComodin ? "default" : "outline"}
                    size="sm"
                    className={`h-9 px-3 gap-1.5 ${
                      currentComodin ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "text-muted-foreground border-clay"
                    }`}
                    onClick={() => setValue(`resultados.${index}.comodin`, !currentComodin, { shouldDirty: true })}
                  >
                    <Star className={`size-4 ${currentComodin ? "fill-white" : ""}`} />
                    x2
                  </Button>
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Sanción (-)</Label>
                  <div className="relative">
                    <ShieldAlert className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-red-500/50" />
                    <Input
                      type="number"
                      min={0}
                      className="w-24 pl-8 h-9 border-clay"
                      placeholder="0"
                      {...form.register(`resultados.${index}.sancion`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t-[3px] border-border/50">
        <Button
          type="submit"
          className="w-full sm:w-auto min-w-40 font-bold border-[3px] border-primary-foreground/20 shadow-clay"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar todos los resultados"}
        </Button>
      </div>
    </form>
  );
}
