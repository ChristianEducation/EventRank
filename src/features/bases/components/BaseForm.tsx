"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Type, Folder, Hash } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { crearBase, editarBase } from "../actions";
import { crearBaseSchema } from "../schemas";
import type { Base } from "../types";

type FormValues = z.infer<typeof crearBaseSchema>;

interface BaseFormProps {
  eventoId: string;
  base?: Base;
  onSuccess?: () => void;
}

export function BaseForm({ eventoId, base, onSuccess }: BaseFormProps) {
  const isEditing = !!base;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(crearBaseSchema) as import("react-hook-form").Resolver<FormValues>,
    defaultValues: {
      titulo: base?.titulo ?? "",
      contenido: base?.contenido ?? "",
      categoria: base?.categoria ?? "",
      orden: base?.orden ?? 0,
      visible: base?.visible ?? true,
    },
  });

  const watchVisible = watch("visible");

  async function onSubmit(data: FormValues) {
    const result = isEditing
      ? await editarBase(base.id, data)
      : await crearBase(eventoId, data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Sección actualizada" : "Sección añadida al reglamento");
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-4">
        
        {/* Título */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold text-foreground flex items-center gap-1.5"><Type className="size-4 text-primary" /> Título de la sección</Label>
          <Input 
            placeholder="Ej. Reglas de Desempate, Penalizaciones..." 
            className={`border-clay ${errors.titulo ? "border-destructive" : ""}`}
            {...register("titulo")} 
          />
          {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold text-foreground">Contenido</Label>
          <Textarea 
            placeholder="Describe el reglamento..." 
            className={`min-h-[150px] border-clay ${errors.contenido ? "border-destructive" : ""}`}
            {...register("contenido")} 
          />
          {errors.contenido && <p className="text-xs text-destructive">{errors.contenido.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Categoría */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium flex items-center gap-1.5"><Folder className="size-4 text-orange-500" /> Categoría (Opcional)</Label>
            <Input 
              placeholder="Ej. General, Deportes..." 
              className="border-clay"
              {...register("categoria")} 
            />
          </div>
          
          {/* Orden */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium flex items-center gap-1.5"><Hash className="size-4 text-muted-foreground" /> Orden (Posición)</Label>
            <Input 
              type="number" 
              min={0}
              className="border-clay"
              {...register("orden")} 
            />
          </div>
        </div>

        {/* Visibilidad */}
        <div className="flex items-center justify-between rounded-xl border-[3px] border-border bg-muted/30 p-3 shadow-clay-sm mt-2">
          <div className="flex flex-col gap-0.5">
            <Label className="font-bold">Sección Visible</Label>
            <p className="text-xs text-muted-foreground">
              Si está desactivado, los participantes no verán esta regla.
            </p>
          </div>
          <Switch
            checked={watchVisible}
            onCheckedChange={(val) => setValue("visible", val)}
            className="border-2 border-border"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onSuccess && (
          <Button type="button" variant="ghost" onClick={onSuccess} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-w-32 border-clay shadow-clay-sm">
          {isSubmitting ? "Guardando..." : (isEditing ? "Actualizar" : "Guardar Sección")}
        </Button>
      </div>
    </form>
  );
}
