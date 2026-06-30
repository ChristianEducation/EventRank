import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllTenantsAndEventos } from "@/features/admin/queries";
import { AdminList } from "@/features/admin/components/AdminList";
import { LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Redirigir si no es super_admin
  if (!user || user.rol !== "super_admin") {
    redirect("/dashboard");
  }

  const tenants = await getAllTenantsAndEventos();

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header del Super Admin */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-500 p-1.5 rounded-lg border-2 border-red-400">
              <ShieldAlert className="size-5 text-white" />
            </div>
            <h1 className="text-xl font-black font-heading tracking-tight">EventRank <span className="text-red-400">SuperAdmin</span></h1>
          </div>
          
          <form action="/auth/sign-out" method="POST">
            <Button variant="ghost" size="sm" type="submit" className="text-slate-300 hover:text-white hover:bg-slate-800">
              <LogOut className="size-4 mr-2" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black font-heading text-foreground">Panel de Control Global</h2>
          <p className="text-muted-foreground mt-1 font-medium text-lg">
            Visión global de todos los clientes (Tenants) y sus eventos.
          </p>
        </div>

        <AdminList tenants={tenants} />
      </main>
    </div>
  );
}
