import { notFound } from "next/navigation";
import Image from "next/image";
import { getEventoPublico } from "@/features/portal/queries";
import { AccesoPin } from "@/features/portal/components/AccesoPin";
import { PortalNav, PortalNavDesktop } from "@/features/portal/components/PortalNav";

interface PortalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);

  if (!evento) {
    notFound();
  }

  // Si tiene un color principal, lo podríamos inyectar como variable CSS en un div superior
  const colorPrincipal = evento.colores && evento.colores.length > 0 ? evento.colores[0] : null;

  const content = (
    <div 
      className="min-h-screen bg-background text-foreground pb-24 md:pb-8 flex flex-col items-center"
      style={colorPrincipal ? { "--primary": colorPrincipal } as React.CSSProperties : {}}
    >
      {/* Header Público */}
      <header className="w-full bg-card border-b-[3px] border-border/50 sticky top-0 z-40 shadow-sm overflow-hidden">
        {/* Barra superior fina con branding del Tenant */}
        <div className="bg-muted px-4 py-1.5 flex justify-center items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30">
          {evento.tenantNombre}
        </div>
        
        <div className="px-4 py-4 md:py-6 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4">
          {evento.imagenUrl ? (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border-[3px] border-border shadow-clay-sm relative bg-muted">
              <Image src={evento.imagenUrl} alt={evento.nombre} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shrink-0 border-[3px] border-border shadow-clay-sm flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl uppercase">
              {evento.nombre.substring(0,2)}
            </div>
          )}
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-black font-heading leading-tight tracking-tight text-foreground">
              {evento.nombre}
            </h1>
            {evento.estado === "finalizado" && (
              <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border-2 border-amber-200">
                Evento Finalizado
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-4 pt-6 md:pt-8 flex-1 flex flex-col">
        <PortalNavDesktop slug={slug} />
        {children}
      </main>

      {/* Mobile Nav */}
      <PortalNav slug={slug} />
    </div>
  );

  if (evento.tipoAcceso === "pin" && evento.pin) {
    return (
      <AccesoPin eventoId={evento.id} pinCorrecto={evento.pin}>
        {content}
      </AccesoPin>
    );
  }

  return content;
}
