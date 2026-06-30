"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { ColorPicker } from "@/components/shared/ColorPicker";

import { crearEvento, editarEvento } from "../actions";
import { crearEventoSchema, type CrearEventoInput } from "../schemas";
import type { Evento } from "../types";

type FormInput = z.input<typeof crearEventoSchema>;

export function EventoForm({ evento }: { evento?: Evento }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, CrearEventoInput>({
    resolver: zodResolver(crearEventoSchema),
    defaultValues: evento
      ? {
          nombre: evento.nombre,
          tipoAcceso: evento.tipoAcceso,
          colores: evento.colores ?? undefined,
          imagenUrl: evento.imagenUrl ?? undefined,
          fechaInicio: evento.fechaInicio ? new Date(evento.fechaInicio) : undefined,
          fechaFin: evento.fechaFin ? new Date(evento.fechaFin) : undefined,
        }
      : { tipoAcceso: "publico" },
  });

  const tipoAcceso = watch("tipoAcceso");
  const colores = watch("colores");

  async function onSubmit(data: CrearEventoInput) {
    const result = evento ? await editarEvento(evento.id, data) : await crearEvento(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(evento ? "Evento actualizado" : "Evento creado");
    router.push(`/dashboard/eventos/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre del evento</Label>
        <Input id="nombre" placeholder="Aniversario Colegio San Luis 2026" {...register("nombre")} />
        {errors.nombre && <p className="text-sm text-destructive" role="alert">{errors.nombre.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tipo de acceso al portal</Label>
        <RadioGroup
          value={tipoAcceso}
          onValueChange={(value) => setValue("tipoAcceso", value as "publico" | "pin")}
          className="flex gap-4"
        >
          <Label className="flex items-center gap-2 font-normal">
            <RadioGroupItem value="publico" />
            Público (link directo)
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <RadioGroupItem value="pin" />
            Con PIN
          </Label>
        </RadioGroup>
        {errors.tipoAcceso && <p className="text-sm text-destructive" role="alert">{errors.tipoAcceso.message}</p>}
      </div>

      {tipoAcceso === "pin" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="pin">PIN de acceso (6 caracteres)</Label>
          <Input id="pin" maxLength={6} placeholder="123456" {...register("pin")} />
          {errors.pin && <p className="text-sm text-destructive" role="alert">{errors.pin.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fechaInicio">Fecha de inicio</Label>
          <Input id="fechaInicio" type="date" {...register("fechaInicio")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fechaFin">Fecha de término</Label>
          <Input id="fechaFin" type="date" {...register("fechaFin")} />
          {errors.fechaFin && <p className="text-sm text-destructive" role="alert">{errors.fechaFin.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Colores del evento (opcional, hasta 3)</Label>
        <ColorPicker value={colores as string[] | undefined} onChange={(c) => setValue("colores", c)} />
        {errors.colores && (
          <p className="text-sm text-destructive" role="alert">
            {errors.colores.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Guardando..." : evento ? "Guardar cambios" : "Crear evento"}
      </Button>
    </form>
  );
}
