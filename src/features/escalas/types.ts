import { InferSelectModel } from "drizzle-orm";
import { escalasPuntaje } from "@/lib/db/schema";

// Tipo base de la base de datos
type EscalaDb = InferSelectModel<typeof escalasPuntaje>;

// Ajustamos el tipo de `puntajes` para que sea más específico que `unknown`.
// La BD lo guarda como jsonb, el spec dice Record<string, number>.
export type Escala = Omit<EscalaDb, "puntajes"> & {
  puntajes: Record<string, number>;
};
