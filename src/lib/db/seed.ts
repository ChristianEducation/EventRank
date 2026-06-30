import { db } from "./index";
import { tenants } from "./schema";

async function seed() {
  const [tenant] = await db
    .insert(tenants)
    .values({
      nombre: "Colegio San Luis",
      slug: "colegio-san-luis",
      plan: "interno",
      emailContacto: process.env.SEED_TENANT_EMAIL!,
      activo: true,
      configuracion: {
        max_grupos: null,
        max_actividades: null,
        max_escalas: null,
        max_eventos_activos: null,
        personalizacion_visual: true,
        multisede: false,
      },
    })
    .onConflictDoNothing()
    .returning({ id: tenants.id });

  if (tenant) {
    console.log("Tenant creado. UUID:", tenant.id);
  } else {
    console.log("Tenant ya existía, no se duplicó.");
  }
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
