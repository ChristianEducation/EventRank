import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EstadoEvento } from "../types";

const ESTILOS: Record<EstadoEvento, string> = {
  borrador: "bg-muted text-muted-foreground",
  activo: "bg-primary/10 text-primary",
  finalizado: "bg-secondary/40 text-secondary-foreground",
};

const ETIQUETAS: Record<EstadoEvento, string> = {
  borrador: "Borrador",
  activo: "Activo",
  finalizado: "Finalizado",
};

export function EventoEstado({ estado }: { estado: EstadoEvento }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", ESTILOS[estado])}>
      {ETIQUETAS[estado]}
    </Badge>
  );
}
