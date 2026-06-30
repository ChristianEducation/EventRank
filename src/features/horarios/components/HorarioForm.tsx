"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Clock, MapPin, Calendar } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { crearHorario, editarHorario } from "../actions";
import { crearHorarioSchema } from "../schemas";
import type { Horario } from "../types";

type FormValues = z.infer<typeof crearHorarioSchema>;

interface HorarioFormProps {
  eventoId: string;
  horario?: Horario;
  onSuccess?: () => void;
}

export function HorarioForm({ eventoId, horario, onSuccess }: HorarioFormProps) {
  const isEditing = !!horario;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(crearHorarioSchema) as any,
    defaultValues: {
      nombreActividad: horario?.nombreActividad ?? "",
      fecha: horario?.fecha ? new Date(horario.fecha) : new Date(),
      horaInicio: horario?.horaInicio ? horario.horaInicio.slice(0,5) : "", // "HH:MM:SS" to "HH:MM"
      horaFin: horario?.horaFin ? horario.horaFin.slice(0,5) : "",
      lugar: horario?.lugar ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jornada: horario?.jornada as any ?? "",
    },
  });

  const watchJornada = watch("jornada");

  async function onSubmit(data: FormValues) {
    const result = isEditing
      ? await editarHorario(horario.id, data)
      : await crearHorario(eventoId, data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Horario actualizado" : "Horario creado");
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-4">
        {/* Nombre Actividad */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold text-foreground">Actividad a realizar</Label>
          <Input 
            placeholder="Ej. Ceremonia de Apertura" 
            className={`border-clay ${errors.nombreActividad ? "border-destructive" : ""}`}
            {...register("nombreActividad")} 
          />
          {errors.nombreActividad && <p className="text-xs text-destructive">{errors.nombreActividad.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Fecha */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium flex items-center gap-1.5"><Calendar className="size-4 text-primary" /> Fecha</Label>
            <Input 
              type="date" 
              className={`border-clay ${errors.fecha ? "border-destructive" : ""}`}
              {...register("fecha")} 
            />
            {errors.fecha && <p className="text-xs text-destructive">{errors.fecha.message as string}</p>}
          </div>
          
          {/* Jornada */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium">Jornada (Opcional)</Label>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Select value={watchJornada} onValueChange={(val) => setValue("jornada", val as any)}>
              <SelectTrigger className="border-clay">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent className="border-[3px] border-border shadow-clay-sm">
                <SelectItem value="mañana">Mañana</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="noche">Noche</SelectItem>
                <SelectItem value=" ">Ninguna</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Hora Inicio */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium flex items-center gap-1.5"><Clock className="size-4 text-green-500" /> Hora Inicio</Label>
            <Input 
              type="time" 
              className={`border-clay ${errors.horaInicio ? "border-destructive" : ""}`}
              {...register("horaInicio")} 
            />
            {errors.horaInicio && <p className="text-xs text-destructive">{errors.horaInicio.message}</p>}
          </div>

          {/* Hora Fin */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium flex items-center gap-1.5"><Clock className="size-4 text-muted-foreground" /> Hora Fin</Label>
            <Input 
              type="time" 
              className={`border-clay ${errors.horaFin ? "border-destructive" : ""}`}
              {...register("horaFin")} 
            />
            {errors.horaFin && <p className="text-xs text-destructive">{errors.horaFin.message}</p>}
          </div>
        </div>

        {/* Lugar */}
        <div className="flex flex-col gap-2">
          <Label className="font-medium flex items-center gap-1.5"><MapPin className="size-4 text-blue-500" /> Lugar / Ubicación (Opcional)</Label>
          <Input 
            placeholder="Ej. Gimnasio Principal, Patio Norte..." 
            className="border-clay"
            {...register("lugar")} 
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
          {isSubmitting ? "Guardando..." : (isEditing ? "Actualizar" : "Añadir a la Agenda")}
        </Button>
      </div>
    </form>
  );
}
