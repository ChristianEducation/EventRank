import { EventoForm } from "@/features/eventos/components/EventoForm";

export default function NuevoEventoPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <h2 className="text-xl font-semibold">Nuevo evento</h2>
      <EventoForm />
    </div>
  );
}
