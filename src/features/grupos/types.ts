import { grupos } from "@/lib/db/schema";

export type Grupo = typeof grupos.$inferSelect;
