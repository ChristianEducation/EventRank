"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { crearActividad, editarActividad } from "../actions";
import { actividadSchema } from "../schemas";
import type { Actividad } from "../types";
import type { Escala } from "@/features/escalas/types";

type FormValues = z.infer<typeof actividadSchema>;

interface ActividadFormProps {
  eventoId: string;
  actividad?: Actividad;
  escalasDisponibles: Escala[];
  onSuccess?: () => void;
}

export function ActividadForm({ eventoId, actividad, escalasDisponibles, onSuccess }: ActividadFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      nombre: actividad?.nombre ?? "",
      descripcion: actividad?.descripcion ?? "",
      reglas: actividad?.reglas ?? "",
      escalaId: actividad?.escalaId ?? "",
    },
  });

  // react-hook-form no registra nativamente el Select de Radix/Shadcn si no se usa Controller.
  // Como simplificación usamos setValue
  const watchEscala = watch("escalaId");

  async function onSubmit(data: FormValues) {
    const result = actividad
      ? await editarActividad(actividad.id, data)
      : await crearActividad(eventoId, data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(actividad ? "Actividad actualizada" : "Actividad creada");
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {/* Nombre */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre-act" className="font-medium">
          Nombre de la actividad
        </Label>
        <Input
          id="nombre-act"
          placeholder="Ej: Carrera de sacos, Debate, Matemáticas..."
          className={`border-clay ${errors.nombre ? "border-destructive" : ""}`}
          autoComplete="off"
          autoFocus
          {...register("nombre")}
        />
        {errors.nombre && <p className="text-sm text-destructive font-medium">{errors.nombre.message}</p>}
      </div>

      {/* Escala */}
      <div className="flex flex-col gap-2">
        <Label className="font-medium">Escala de puntuación asignada</Label>
        <Select
          value={watchEscala}
          onValueChange={(value) => setValue("escalaId", value || "", { shouldValidate: true })}
        >
          <SelectTrigger className={`border-clay ${errors.escalaId ? "border-destructive" : ""}`}>
            <SelectValue placeholder="Seleccione una escala..." />
          </SelectTrigger>
          <SelectContent className="border-[3px] border-border shadow-clay-sm">
            {escalasDisponibles.length === 0 ? (
              <SelectItem value="empty" disabled>No hay escalas creadas</SelectItem>
            ) : (
              escalasDisponibles.map((esc) => (
                <SelectItem key={esc.id} value={esc.id}>
                  {esc.nombre}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.escalaId && <p className="text-sm text-destructive font-medium">{errors.escalaId.message}</p>}
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="desc-act" className="font-medium text-muted-foreground">
          Descripción (Opcional)
        </Label>
        <Textarea
          id="desc-act"
          placeholder="Pequeño resumen de la actividad..."
          className="border-clay resize-none"
          rows={2}
          {...register("descripcion")}
        />
        {errors.descripcion && <p className="text-sm text-destructive font-medium">{errors.descripcion.message}</p>}
      </div>

      {/* Reglas */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="reglas-act" className="font-medium text-muted-foreground">
          Reglas (Opcional)
        </Label>
        <Textarea
          id="reglas-act"
          placeholder="Ej: 5 participantes por grupo, máximo 10 minutos."
          className="border-clay resize-none"
          rows={3}
          {...register("reglas")}
        />
        {errors.reglas && <p className="text-sm text-destructive font-medium">{errors.reglas.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t-[3px] border-border pt-4 mt-2">
        {onSuccess && (
          <Button type="button" variant="ghost" onClick={onSuccess} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-w-32 border-clay shadow-clay-sm">
          {isSubmitting ? "Guardando..." : actividad ? "Guardar cambios" : "Crear actividad"}
        </Button>
      </div>
    </form>
  );
}
