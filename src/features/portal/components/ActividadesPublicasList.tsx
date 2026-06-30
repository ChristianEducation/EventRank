"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Actividad {
  id: string;
  nombre: string;
  descripcion?: string | null;
  reglas?: string | null;
}

interface ActividadesPublicasListProps {
  actividades: Actividad[];
}

export function ActividadesPublicasList({ actividades }: ActividadesPublicasListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);

  const itemsPerPage = 12;

  const filtered = actividades.filter(a => 
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentActividades = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar competencias..." 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9 bg-card border-[3px] border-border shadow-clay-sm h-12 text-base rounded-2xl"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card border-[3px] border-border rounded-3xl">
          No se encontraron competencias que coincidan con &quot;{searchTerm}&quot;.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {currentActividades.map((act) => (
            <button
              key={act.id}
              onClick={() => setSelectedActividad(act)}
              className="flex items-center justify-between text-left p-4 rounded-2xl border-[3px] border-border shadow-clay-sm bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{act.nombre}</span>
              </div>
              <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-110">
                <BookOpen className="size-4" />
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2 border-[3px] border-border rounded-2xl bg-card px-4 py-2 shadow-clay-sm">
          <span className="text-sm text-muted-foreground font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon-sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-2 border-transparent"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon-sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-2 border-transparent"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedActividad} onOpenChange={(open) => !open && setSelectedActividad(null)}>
        <DialogContent className="sm:max-w-md bg-card border-[3px] border-border shadow-clay mx-4 w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedActividad?.nombre}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 mt-2 max-h-[60vh] overflow-y-auto pr-2">
            
            {selectedActividad?.descripcion && (
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Descripción</span>
                <p className="text-sm text-foreground leading-relaxed">{selectedActividad.descripcion}</p>
              </div>
            )}
            
            {selectedActividad?.reglas && (
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Reglas y Condiciones</span>
                <div className="text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border/50 whitespace-pre-wrap">
                  {selectedActividad.reglas}
                </div>
              </div>
            )}
            
            {!selectedActividad?.descripcion && !selectedActividad?.reglas && (
              <p className="text-sm text-muted-foreground italic">No hay detalles adicionales para esta competencia.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
