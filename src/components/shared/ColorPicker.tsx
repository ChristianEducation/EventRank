"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

// Caja de 12 colores clásicos: los nombres que cualquiera reconoce a simple vista
// (negro, blanco, rojo...), pensada para identificar grupos/equipos o para
// combinar colores de marca de un evento (ej. los colores de un colegio).
export const COLOR_PRESETS = [
  { nombre: "Negro", hex: "#000000" },
  { nombre: "Blanco", hex: "#FFFFFF" },
  { nombre: "Gris", hex: "#6B7280" },
  { nombre: "Marrón", hex: "#92400E" },
  { nombre: "Rojo", hex: "#EF4444" },
  { nombre: "Naranja", hex: "#F97316" },
  { nombre: "Amarillo", hex: "#FACC15" },
  { nombre: "Verde", hex: "#22C55E" },
  { nombre: "Verde limón", hex: "#A3E635" },
  { nombre: "Azul", hex: "#3B82F6" },
  { nombre: "Celeste", hex: "#38BDF8" },
  { nombre: "Rosa", hex: "#EC4899" },
];

// Contraste aproximado (luminancia relativa) para decidir si el ícono de
// seleccionado debe ser blanco o negro segun cuan claro es el color de fondo.
function esColorClaro(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6;
}

export function ColorPicker({
  value,
  onChange,
  max = 3,
}: {
  value: string[] | undefined;
  onChange: (colors: string[] | undefined) => void;
  max?: number;
}) {
  const seleccionados = value ?? [];
  const enElLimite = seleccionados.length >= max;

  function alternar(color: string) {
    if (seleccionados.includes(color)) {
      const sinColor = seleccionados.filter((c) => c !== color);
      onChange(sinColor.length > 0 ? sinColor : undefined);
      return;
    }
    if (enElLimite) return;
    onChange([...seleccionados, color]);
  }

  function quitar(color: string) {
    const sinColor = seleccionados.filter((c) => c !== color);
    onChange(sinColor.length > 0 ? sinColor : undefined);
  }

  return (
    <div className="flex flex-col gap-3">
      {seleccionados.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {seleccionados.map((color) => {
            const nombre = COLOR_PRESETS.find((p) => p.hex.toLowerCase() === color.toLowerCase())?.nombre;
            return (
              <button
                key={color}
                type="button"
                onClick={() => quitar(color)}
                aria-label={`Quitar color ${nombre ?? color}`}
                className="flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium"
              >
                <span
                  className="size-5 rounded-full border border-border/60"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                {nombre ?? color}
                <X className="size-3.5" aria-hidden />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {COLOR_PRESETS.map(({ nombre, hex }) => {
          const seleccionado = seleccionados.includes(hex);
          const deshabilitado = !seleccionado && enElLimite;
          const claro = esColorClaro(hex);
          return (
            <button
              key={hex}
              type="button"
              aria-label={`Color ${nombre}`}
              aria-pressed={seleccionado}
              disabled={deshabilitado}
              onClick={() => alternar(hex)}
              className={cn(
                "flex size-11 items-center justify-center rounded-full border-2 transition-transform",
                seleccionado ? "border-foreground scale-110" : "border-border/60",
                deshabilitado && "cursor-not-allowed opacity-40",
              )}
              style={{ backgroundColor: hex }}
            >
              {seleccionado && (
                <Check className={cn("size-5 drop-shadow", claro ? "text-black" : "text-white")} aria-hidden />
              )}
            </button>
          );
        })}

        <label
          className={cn(
            "relative flex size-11 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-xs text-muted-foreground",
            enElLimite ? "cursor-not-allowed opacity-40" : "cursor-pointer",
          )}
        >
          <span className="sr-only">Color personalizado</span>
          +
          <input
            type="color"
            aria-label="Elegir color personalizado"
            disabled={enElLimite}
            value="#4F46E5"
            onChange={(e) => alternar(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        {seleccionados.length}/{max} colores seleccionados
      </p>
    </div>
  );
}
