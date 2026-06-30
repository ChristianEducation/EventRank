"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { crearEscala, editarEscala } from "../actions";
import type { Escala } from "../types";

// Schema adaptado para el formulario (array de objetos para react-hook-form)
const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60),
  puntajesArray: z
    .array(
      z.object({
        lugar: z.string().regex(/^\d+$/, "Debe ser número entero"),
        puntos: z.preprocess((val) => Number(val), z.number().int().min(0)),
      })
    )
    .min(1, "Debe haber al menos un lugar definido")
    // Validación extra: no puede haber lugares duplicados
    .refine(
      (items) => {
        const lugares = items.map((i) => i.lugar);
        return new Set(lugares).size === lugares.length;
      },
      { message: "Hay lugares duplicados en la escala" }
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface EscalaFormProps {
  eventoId: string;
  escala?: Escala;
  onSuccess?: () => void;
}

export function EscalaForm({ eventoId, escala, onSuccess }: EscalaFormProps) {
  const router = useRouter();
  
  // Transformar de Record<string, number> a Array<{ lugar: string, puntos: number }>
  const defaultPuntajes = escala?.puntajes
    ? Object.entries(escala.puntajes)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([lugar, puntos]) => ({ lugar, puntos }))
    : [
        { lugar: "1", puntos: 100 },
        { lugar: "2", puntos: 80 },
        { lugar: "3", puntos: 60 },
      ];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      nombre: escala?.nombre ?? "",
      puntajesArray: defaultPuntajes,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "puntajesArray",
  });

  async function onSubmit(data: FormValues) {
    // Transformar de vuelta a Record<string, number>
    const puntajesRecord: Record<string, number> = {};
    for (const item of data.puntajesArray) {
      puntajesRecord[item.lugar] = item.puntos;
    }

    const payload = {
      nombre: data.nombre,
      puntajes: puntajesRecord,
    };

    const result = escala
      ? await editarEscala(escala.id, payload)
      : await crearEscala(eventoId, payload);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(escala ? "Escala actualizada" : "Escala creada");
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {/* Nombre */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre-escala" className="font-medium">
          Nombre de la escala
        </Label>
        <Input
          id="nombre-escala"
          placeholder="Ej: Medallas, Puntos Base, Completa..."
          autoComplete="off"
          autoFocus
          className={`border-clay ${errors.nombre ? "border-destructive" : ""}`}
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive font-medium">{errors.nombre.message}</p>
        )}
      </div>

      {/* Puntajes */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Puntajes por posición</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                lugar: String(fields.length + 1),
                puntos: 0,
              })
            }
            className="h-8 gap-1 border-clay shadow-clay-sm"
          >
            <Plus className="size-3.5" />
            Agregar
          </Button>
        </div>

        {errors.puntajesArray?.root && (
          <p className="text-sm text-destructive font-medium">
            {errors.puntajesArray.root.message}
          </p>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border-[3px] border-border bg-muted/40 p-3 shadow-clay-sm">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <Input
                  type="text"
                  placeholder="Lugar (ej: 1)"
                  className={`border-clay ${errors.puntajesArray?.[index]?.lugar ? "border-destructive" : ""}`}
                  {...register(`puntajesArray.${index}.lugar`)}
                />
              </div>
              <span className="mt-2.5 font-bold text-muted-foreground">→</span>
              <div className="flex-1 flex flex-col gap-1">
                <Input
                  type="number"
                  placeholder="Puntos"
                  className={`border-clay ${errors.puntajesArray?.[index]?.puntos ? "border-destructive" : ""}`}
                  {...register(`puntajesArray.${index}.puntos`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={fields.length === 1}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex w-full justify-between text-xs font-medium text-destructive px-1">
             <div className="flex-1 truncate">{errors.puntajesArray?.[0]?.lugar?.message}</div>
             <div className="flex-1 truncate text-right pr-8">{errors.puntajesArray?.[0]?.puntos?.message}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t-[3px] border-border pt-4">
        {onSuccess && (
          <Button type="button" variant="ghost" onClick={onSuccess} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-32 border-clay shadow-clay-sm"
        >
          {isSubmitting ? "Guardando..." : escala ? "Guardar cambios" : "Crear escala"}
        </Button>
      </div>
    </form>
  );
}
