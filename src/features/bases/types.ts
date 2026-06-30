import { InferSelectModel } from "drizzle-orm";
import { reglasGenerales } from "@/lib/db/schema";

export type Base = InferSelectModel<typeof reglasGenerales>;
