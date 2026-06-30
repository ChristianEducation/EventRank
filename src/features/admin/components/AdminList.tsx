"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Building2, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { activarEventoManual } from "../actions";
import { useRouter } from "next/navigation";

// Definimos el tipo en base a lo que devuelve la query
type AdminTenant = {
  id: string;
  nombre: string;
  slug: string;
  plan: string;
  activo: boolean;
  createdAt: Date;
  eventos: {
    id: string;
    nombre: string;
    slug: string;
    estado: "borrador" | "activo" | "finalizado";
    createdAt: Date;
  }[];
};

interface AdminListProps {
  tenants: AdminTenant[];
}

export function AdminList({ tenants }: AdminListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleActivar(eventoId: string) {
    setLoadingId(eventoId);
    const res = await activarEventoManual(eventoId);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success("Evento activado correctamente");
      router.refresh();
    }
    setLoadingId(null);
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {tenants.map((t) => (
        <div key={t.id} className="flex flex-col gap-4 p-6 rounded-3xl border-[3px] border-border shadow-clay bg-card">
          {/* Header del Tenant */}
          <div className="flex items-start justify-between border-b-[3px] border-border/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/20 shrink-0">
                <Building2 className="size-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black font-heading leading-tight">{t.nombre}</h2>
                <span className="text-sm text-muted-foreground font-medium">/{t.slug} • Plan: <span className="uppercase font-bold text-foreground">{t.plan}</span></span>
              </div>
            </div>
            {!t.activo && (
              <Badge variant="destructive" className="border-[2px] shadow-sm">Tenant Inactivo</Badge>
            )}
          </div>

          {/* Lista de Eventos */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Eventos del Cliente</h3>
            
            {t.eventos.length === 0 ? (
              <div className="p-4 bg-muted/50 rounded-xl border border-border/50 text-center text-sm text-muted-foreground">
                No hay eventos creados.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {t.eventos.map((e) => (
                  <div key={e.id} className="flex flex-col p-4 rounded-xl border-[3px] border-border bg-background shadow-clay-sm gap-3 justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold leading-tight">{e.nombre}</h4>
                        {e.estado === "borrador" && <Badge variant="secondary" className="bg-slate-200 text-slate-800 hover:bg-slate-300">Borrador</Badge>}
                        {e.estado === "activo" && <Badge variant="default" className="bg-green-500 hover:bg-green-600">Activo</Badge>}
                        {e.estado === "finalizado" && <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">Finalizado</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">/{e.slug}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        {format(new Date(e.createdAt), "dd MMM, yy")}
                      </div>
                      
                      {e.estado === "borrador" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleActivar(e.id)} 
                          disabled={loadingId === e.id}
                          className="h-7 text-xs font-bold gap-1.5 border-clay shadow-clay-sm"
                        >
                          <ShieldCheck className="size-3.5" />
                          Activar (MVP)
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
