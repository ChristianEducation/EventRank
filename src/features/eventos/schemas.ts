import { z } from "zod";

const hexColor = /^#[0-9A-F]{6}$/i;

// Los inputs de texto vacíos llegan como "" desde el formulario, no como undefined.
// Sin esto, un campo "opcional" se vuelve obligatorio porque "" no cumple el formato.
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const imagenUrlSchema = z.preprocess(emptyToUndefined, z.string().url().optional());
const pinSchema = z.preprocess(emptyToUndefined, z.string().length(6).optional());
const coloresSchema = z.array(z.string().regex(hexColor)).max(3).optional();

export const crearEventoSchema = z
  .object({
    nombre: z.string().min(3).max(100),
    tipoAcceso: z.enum(["publico", "pin"]),
    pin: pinSchema,
    colores: coloresSchema,
    imagenUrl: imagenUrlSchema,
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
  })
  .refine((d) => d.tipoAcceso !== "pin" || !!d.pin, {
    message: "El PIN es obligatorio si el acceso es por PIN",
    path: ["pin"],
  })
  .refine((d) => !d.fechaInicio || !d.fechaFin || d.fechaFin >= d.fechaInicio, {
    message: "La fecha de término debe ser igual o posterior a la de inicio",
    path: ["fechaFin"],
  });

export type CrearEventoInput = z.infer<typeof crearEventoSchema>;

export const editarEventoSchema = z
  .object({
    nombre: z.string().min(3).max(100).optional(),
    tipoAcceso: z.enum(["publico", "pin"]).optional(),
    pin: pinSchema,
    colores: coloresSchema,
    imagenUrl: imagenUrlSchema,
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
  })
  .refine((d) => !d.fechaInicio || !d.fechaFin || d.fechaFin >= d.fechaInicio, {
    message: "La fecha de término debe ser igual o posterior a la de inicio",
    path: ["fechaFin"],
  });

export type EditarEventoInput = z.infer<typeof editarEventoSchema>;
