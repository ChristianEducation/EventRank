import { notFound } from "next/navigation";
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
      {/* Header Público (Glassmorphism y compacto) */}
      <header className="w-full bg-background/60 backdrop-blur-md border-b-2 border-border/50 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Barra superior fina con branding del Tenant */}
        <div className="bg-muted/80 backdrop-blur-sm px-4 py-1 flex justify-center items-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30">
          {evento.tenantNombre}
        </div>
        
        <div className="px-4 py-2 md:py-3 max-w-6xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black font-heading leading-snug tracking-tight text-foreground truncate">
            {evento.nombre}
          </h1>
          {evento.estado === "finalizado" && (
            <span className="shrink-0 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] md:text-xs font-bold text-amber-800 border-2 border-amber-200">
              Finalizado
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-4 pt-6 md:pt-8 flex-1 flex flex-col">
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
