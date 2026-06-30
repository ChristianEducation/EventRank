"use client";

import { useState, useRef } from "react";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Si `papaparse` no está instalado, fallará el build, asumiré que lo instalaremos o podemos usar un parseo simple nativo
// Optaré por parseo simple para evitar dependencias, ya que es un MVP de 4 columnas
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { procesarCargaMasiva } from "../actions";
import type { FilaActividad, ErrorFila } from "../types";

export function CargaMasivaActividades({ eventoId, onSuccess }: { eventoId: string; onSuccess?: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errores, setErrores] = useState<ErrorFila[]>([]);
  const [creadas, setCreadas] = useState<number | null>(null);

  const handleDescargarPlantilla = () => {
    // Generar CSV dinámico simple
    const csvContent = "nombre,descripcion,reglas,nombre_escala\nCarrera de Sacos,Carrera clásica,,Oro\nDebate,,Max 5 min,Puntos Base\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_actividades.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrores([]);
    setCreadas(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        toast.error("Archivo vacío o no legible");
        setIsProcessing(false);
        return;
      }

      // 1. Parsear CSV manual básico
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
      if (lines.length < 2) {
        toast.error("El archivo no tiene filas de datos");
        setIsProcessing(false);
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const requiredHeaders = ["nombre", "descripcion", "reglas", "nombre_escala"];
      
      const isValidHeaders = requiredHeaders.every(req => headers.includes(req));
      if (!isValidHeaders) {
        toast.error(`Las columnas deben ser exactamente: ${requiredHeaders.join(", ")}`);
        setIsProcessing(false);
        return;
      }

      // Extraer datos usando los índices
      const idxNombre = headers.indexOf("nombre");
      const idxDesc = headers.indexOf("descripcion");
      const idxReglas = headers.indexOf("reglas");
      const idxEscala = headers.indexOf("nombre_escala");

      const filas: FilaActividad[] = [];
      
      // Desde 1 para ignorar headers
      for (let i = 1; i < lines.length; i++) {
        // Soporte básico para comas (sin comillas escapadas, para MVP)
        const cols = lines[i].split(",");
        
        filas.push({
          nombre: cols[idxNombre]?.trim() || "",
          descripcion: cols[idxDesc]?.trim() || "",
          reglas: cols[idxReglas]?.trim() || "",
          nombre_escala: cols[idxEscala]?.trim() || "",
        });
      }

      // 2. Enviar a procesar (Server Action)
      const result = await procesarCargaMasiva(eventoId, filas);
      
      if (!result.success) {
        toast.error(result.error);
      } else {
        setCreadas(result.data.creadas);
        setErrores(result.data.errores);
        if (result.data.creadas > 0) {
          toast.success(`Se crearon ${result.data.creadas} actividades exitosamente`);
          router.refresh();
          onSuccess?.();
        }
      }
      setIsProcessing(false);
    };
    
    reader.onerror = () => {
      toast.error("Error leyendo el archivo");
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
    // Limpiar input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border-[3px] border-border bg-muted/30 p-4 flex flex-col gap-4">
        <div>
          <h4 className="font-semibold text-foreground">1. Descarga la plantilla</h4>
          <p className="text-sm text-muted-foreground mb-3">Rellena el Excel o CSV siguiendo las columnas indicadas.</p>
          <Button variant="outline" size="sm" className="border-clay shadow-clay-sm" onClick={handleDescargarPlantilla}>
            <Download className="size-4 mr-1.5" />
            Descargar plantilla .csv
          </Button>
        </div>
        
        <div className="border-t-[3px] border-border/20 pt-4">
          <h4 className="font-semibold text-foreground">2. Sube el archivo completado</h4>
          <p className="text-sm text-muted-foreground mb-3">Las actividades con nombre de escala no existente serán omitidas.</p>
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <Button 
            className="border-clay shadow-clay-sm" 
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4 mr-1.5" />
            {isProcessing ? "Procesando..." : "Subir CSV"}
          </Button>
        </div>
      </div>

      {/* Resultados del proceso */}
      {(creadas !== null || errores.length > 0) && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
          {creadas !== null && creadas > 0 && (
            <Alert className="border-[3px] border-border bg-accent/30 shadow-clay-sm">
              <CheckCircle2 className="size-4 text-accent-foreground" />
              <AlertTitle className="text-accent-foreground font-bold">Éxito</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                Se agregaron {creadas} actividades al evento.
              </AlertDescription>
            </Alert>
          )}

          {errores.length > 0 && (
            <div className="rounded-2xl border-[3px] border-border bg-card p-4 shadow-clay-sm">
              <div className="flex items-center gap-2 text-destructive font-bold mb-2">
                <AlertCircle className="size-4" />
                <span>Omitidas ({errores.length})</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto pr-2">
                {errores.map((err, i) => (
                  <li key={i} className="flex gap-2 border-b border-border/20 pb-1 last:border-0">
                    <span className="font-mono bg-muted px-1 rounded">Fila {err.fila}</span>
                    <span>{err.motivo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
