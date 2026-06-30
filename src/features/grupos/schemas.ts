import { z } from "zod";

const hexColor = /^#[0-9A-F]{6}$/i;

export const grupoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60, "Máximo 60 caracteres"),
  color: z
    .string()
    .regex(hexColor, "El color debe ser un valor hexadecimal válido")
    .optional(),
});

export const editarGrupoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60, "Máximo 60 caracteres").optional(),
  color: z
    .string()
    .regex(hexColor, "El color debe ser un valor hexadecimal válido")
    .optional(),
  orden: z.number().int().min(0).optional(),
});

export type GrupoInput = z.infer<typeof grupoSchema>;
export type EditarGrupoInput = z.infer<typeof editarGrupoSchema>;
