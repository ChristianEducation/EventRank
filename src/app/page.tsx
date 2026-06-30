import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { Trophy } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <Trophy className="size-12 text-primary" aria-hidden />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">EventRank</h1>
        <p className="max-w-sm text-muted-foreground">
          El marcador oficial en vivo de tu evento competitivo.
        </p>
      </div>
      <SignInButton mode="modal">
        <Button size="lg">Iniciar sesión</Button>
      </SignInButton>
    </div>
  );
}
