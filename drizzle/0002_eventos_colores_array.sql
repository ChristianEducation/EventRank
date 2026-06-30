ALTER TABLE "eventos" ADD COLUMN "colores" jsonb;
--> statement-breakpoint
UPDATE "eventos" SET "colores" = jsonb_build_array("color_principal") WHERE "color_principal" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "eventos" DROP COLUMN "color_principal";
