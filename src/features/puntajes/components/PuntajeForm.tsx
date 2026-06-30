"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Trophy, Star, ShieldAlert } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ingresarPuntaje, editarPuntaje } from "../actions";
import { ingresarPuntajeSchema } from "../schemas";
import type { Puntaje } from "../types";
import type { Grupo } from "@/features/grupos/types";
import type { Actividad } from "@/features/actividades/types";

type FormValues = z.infer<typeof ingresarPuntajeSchema>;

interface PuntajeFormProps {
  puntaje?: Puntaje;
  grupos: Grupo[];
  actividades: Actividad[];
  onSuccess?: () => void;
  // Permite pre-seleccionar una actividad si venimos de un filtro
  defaultActividadId?: string;
}

export function PuntajeForm({ puntaje, grupos, actividades, onSuccess, defaultActividadId }: PuntajeFormProps) {
  const router = useRouter();
  const isEditing = !!puntaje;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(ingresarPuntajeSchema) as import("react-hook-form").Resolver<FormValues>,
    defaultValues: {
      actividadId: puntaje?.actividadId ?? defaultActividadId ?? "",
      grupoId: puntaje?.grupoId ?? "",
      lugar: puntaje?.lugar ?? 1,
      comodin: puntaje?.comodin ?? false,
      bonificacion: puntaje?.bonificacion ?? 0,
      sancion: puntaje?.sancion ?? 0,
      publico: puntaje?.publico ?? false,
    },
  });

  const watchActividad = watch("actividadId");
  const watchGrupo = watch("grupoId");
  const watchComodin = watch("comodin");
  const watchPublico = watch("publico");

  async function onSubmit(data: FormValues) {
    const result = isEditing
      ? await editarPuntaje(puntaje.id, data)
      : await ingresarPuntaje(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Puntaje actualizado" : "Puntaje guardado");
    
    // Si se editó y antes era público, advertir que ahora es privado por RN-02
    if (isEditing && puntaje.publico && !data.publico) {
      toast.info("El puntaje editado ahora está oculto y requiere republicación.");
    }

    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      
      {/* Selector de Actividad y Grupo (solo habilitados al crear) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="font-medium">Actividad</Label>
          <Select
            disabled={isEditing}
            value={watchActividad}
            onValueChange={(val) => setValue("actividadId", val || "", { shouldValidate: true })}
          >
            <SelectTrigger className={`border-clay ${errors.actividadId ? "border-destructive" : ""}`}>
              <SelectValue placeholder="Competencia..." />
            </SelectTrigger>
            <SelectContent className="border-[3px] border-border shadow-clay-sm">
              {actividades.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.actividadId && <p className="text-xs text-destructive">{errors.actividadId.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="font-medium">Grupo</Label>
          <Select
            disabled={isEditing}
            value={watchGrupo}
            onValueChange={(val) => setValue("grupoId", val || "", { shouldValidate: true })}
          >
            <SelectTrigger className={`border-clay ${errors.grupoId ? "border-destructive" : ""}`}>
              <SelectValue placeholder="Alianza/Grupo..." />
            </SelectTrigger>
            <SelectContent className="border-[3px] border-border shadow-clay-sm">
              {grupos.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full border border-border" style={{ backgroundColor: g.color || "#ccc" }} />
                    {g.nombre}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.grupoId && <p className="text-xs text-destructive">{errors.grupoId.message}</p>}
        </div>
      </div>

      <div className="rounded-2xl border-[3px] border-border bg-muted/30 p-4 flex flex-col gap-5">
        {/* Lugar Obtenido */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="lugar" className="font-semibold text-foreground flex items-center gap-1.5">
            <Trophy className="size-4 text-orange-500" /> Lugar obtenido
          </Label>
          <Input
            id="lugar"
            type="number"
            min={1}
            className={`border-clay bg-background text-lg font-bold w-32 ${errors.lugar ? "border-destructive" : ""}`}
            {...register("lugar")}
          />
          <p className="text-xs text-muted-foreground">Debe corresponder a una posición de la escala.</p>
          {errors.lugar && <p className="text-xs text-destructive">{errors.lugar.message}</p>}
        </div>

        {/* Modificadores */}
        <div className="grid grid-cols-2 gap-4 border-t-[3px] border-border/30 pt-4">
          <div className="col-span-2 flex items-center justify-between rounded-xl border-[3px] border-border bg-background p-3 shadow-sm">
            <div className="flex flex-col gap-1">
              <Label htmlFor="comodin-switch" className="font-bold flex items-center gap-1.5">
                <Star className="size-4 text-yellow-500" /> Usar Comodín (x2)
              </Label>
              <p className="text-[11px] text-muted-foreground leading-tight">Duplica el puntaje base obtenido.</p>
            </div>
            <Switch
              id="comodin-switch"
              checked={watchComodin}
              onCheckedChange={(val) => setValue("comodin", val)}
              className="data-[state=checked]:bg-yellow-500 border-2 border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bonif" className="font-medium text-green-600">Bonificación (+)</Label>
            <Input
              id="bonif"
              type="number"
              min={0}
              className="border-clay"
              {...register("bonificacion")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sancion" className="font-medium text-destructive flex items-center gap-1">
              <ShieldAlert className="size-3.5" /> Sanción (-)
            </Label>
            <Input
              id="sancion"
              type="number"
              min={0}
              className="border-clay"
              {...register("sancion")}
            />
          </div>
        </div>
      </div>

      {/* Visibilidad */}
      <div className="flex items-center justify-between rounded-xl border-[3px] border-border bg-blue-50/50 dark:bg-blue-950/20 p-3 shadow-clay-sm">
        <div className="flex flex-col gap-0.5">
          <Label className="font-bold">Publicar resultado</Label>
          <p className="text-xs text-muted-foreground">
            {isEditing && puntaje?.publico
              ? "Si modificas algo, pasará a borrador (Privado) por seguridad."
              : "Si está inactivo, no sumará al ranking público todavía."}
          </p>
        </div>
        <Switch
          checked={watchPublico}
          onCheckedChange={(val) => setValue("publico", val)}
          className="border-2 border-border"
        />
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 border-t-[3px] border-border pt-4">
        {onSuccess && (
          <Button type="button" variant="ghost" onClick={onSuccess} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-w-32 border-clay shadow-clay-sm">
          {isSubmitting ? "Guardando..." : "Guardar Puntaje"}
        </Button>
      </div>
    </form>
  );
}
