"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/shared/ColorPicker";
import { COLOR_PRESETS } from "@/components/shared/ColorPicker";

import { crearGrupo, editarGrupo } from "../actions";
import { grupoSchema, type GrupoInput } from "../schemas";
import type { Grupo } from "../types";

interface GrupoFormProps {
  eventoId: string;
  grupo?: Grupo;
  onSuccess?: () => void;
}

export function GrupoForm({ eventoId, grupo, onSuccess }: GrupoFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GrupoInput>({
    resolver: zodResolver(grupoSchema),
    defaultValues: {
      nombre: grupo?.nombre ?? "",
      color: grupo?.color ?? undefined,
    },
  });

  // ColorPicker trabaja con string[]; grupos usa un único color.
  const colorValue = watch("color");
  const coloresArray = colorValue ? [colorValue] : undefined;
  const nombreColor = colorValue
    ? (COLOR_PRESETS.find((p) => p.hex.toLowerCase() === colorValue.toLowerCase())?.nombre ?? colorValue)
    : null;

  function handleColorChange(colors: string[] | undefined) {
    setValue("color", colors?.[0] ?? undefined, { shouldValidate: true });
  }

  async function onSubmit(data: GrupoInput) {
    const result = grupo
      ? await editarGrupo(grupo.id, data)
      : await crearGrupo(eventoId, data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(grupo ? "Grupo actualizado" : "Grupo creado");
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {/* Campo nombre */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre-grupo" className="font-medium">
          Nombre del grupo
        </Label>
        <Input
          id="nombre-grupo"
          placeholder="Ej: Alianza Azul, Equipo Rojo..."
          autoComplete="off"
          autoFocus
          {...register("nombre")}
          className={errors.nombre ? "border-destructive" : ""}
        />
        {errors.nombre ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.nombre.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nombre que verán los participantes en el portal.
          </p>
        )}
      </div>

      {/* Selector de color */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Color del grupo</Label>
          {colorValue ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="inline-block size-3.5 rounded-full border border-border/60"
                style={{ backgroundColor: colorValue }}
                aria-hidden
              />
              {nombreColor}
              <button
                type="button"
                onClick={() => setValue("color", undefined)}
                className="ml-1 text-muted-foreground/60 underline underline-offset-2 hover:text-foreground"
                aria-label="Quitar color"
              >
                quitar
              </button>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sin color</span>
          )}
        </div>

        {/* Preview del grupo con el color seleccionado */}
        {colorValue && (
          <div className="flex items-center gap-3 rounded-2xl border-[3px] border-border bg-muted/40 px-3 py-2.5 shadow-clay-sm">
            <span
              className="size-8 shrink-0 rounded-full border-2 shadow-inner"
              style={{ backgroundColor: colorValue, borderColor: colorValue }}
              aria-hidden
            />
            <span className="text-sm font-medium">
              {watch("nombre") || "Nombre del grupo"}
            </span>
          </div>
        )}

        <ColorPicker
          value={coloresArray}
          onChange={handleColorChange}
          max={1}
        />

        {errors.color && (
          <p className="text-sm text-destructive" role="alert">
            {errors.color.message}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        {onSuccess && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-w-28">
          {isSubmitting
            ? "Guardando..."
            : grupo
              ? "Guardar cambios"
              : "Crear grupo"}
        </Button>
      </div>
    </form>
  );
}
