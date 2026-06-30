"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AccesoPinProps {
  eventoId: string;
  pinCorrecto: string;
  children: React.ReactNode;
}

export function AccesoPin({ eventoId, pinCorrecto, children }: AccesoPinProps) {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const savedPin = localStorage.getItem(`eventrank_pin_${eventoId}`);
    if (savedPin === pinCorrecto) {
      setAutenticado(true);
    } else {
      setAutenticado(false);
    }
  }, [eventoId, pinCorrecto]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === pinCorrecto) {
      localStorage.setItem(`eventrank_pin_${eventoId}`, pin);
      setAutenticado(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  // Prevents hydration mismatch and initial flicker
  if (autenticado === null) {
    return <div className="min-h-screen bg-background" />;
  }

  if (autenticado) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card p-8 rounded-3xl border-[3px] border-border shadow-clay flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 border-4 border-background shadow-inner">
          <Lock className="size-7 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-foreground mb-2">Evento Privado</h2>
        <p className="text-muted-foreground text-sm mb-8">
          Ingresa el código PIN proporcionado por el organizador para acceder al portal.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Ingresa el PIN"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            className={`text-center font-bold text-lg tracking-widest uppercase border-clay h-12 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
            maxLength={6}
          />
          {error && <p className="text-xs text-destructive font-bold">PIN incorrecto, intenta de nuevo.</p>}
          <Button type="submit" size="lg" className="w-full font-bold border-clay shadow-clay-sm text-base">
            Acceder
          </Button>
        </form>
      </div>
    </div>
  );
}
