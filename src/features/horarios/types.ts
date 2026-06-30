import { InferSelectModel } from "drizzle-orm";
import { horarios } from "@/lib/db/schema";

export type Horario = InferSelectModel<typeof horarios>;
