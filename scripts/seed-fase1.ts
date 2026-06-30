import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { tenants, eventos, grupos, escalasPuntaje } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Iniciando Seed de Fase 1: Alianzas y Escalas...");

  // 1. Obtener o crear Tenant y Evento por defecto
  let tenantId = "";
  let eventoId = "";

  const existingTenants = await db.select().from(tenants).limit(1);
  
  if (existingTenants.length === 0) {
    console.log("Creando Tenant por defecto...");
    const [newTenant] = await db.insert(tenants).values({
      nombre: "Colegio San Luis",
      slug: "csl",
      plan: "pro",
      configuracion: {},
      emailContacto: "admin@colegiosanluis.cl",
    }).returning();
    tenantId = newTenant.id;
  } else {
    tenantId = existingTenants[0].id;
    console.log(`Usando Tenant existente: ${existingTenants[0].nombre}`);
  }

  const existingEventos = await db.select().from(eventos).where(eq(eventos.tenantId, tenantId)).limit(1);
  
  if (existingEventos.length === 0) {
    console.log("Creando Evento Aniversario 110...");
    const [newEvento] = await db.insert(eventos).values({
      tenantId,
      nombre: "Aniversario 110",
      slug: "110",
      estado: "activo", // Lo dejamos activo para el portal
      tipoAcceso: "publico" // Público para facilitar el testeo inicial
    }).returning();
    eventoId = newEvento.id;
  } else {
    eventoId = existingEventos[0].id;
    console.log(`Usando Evento existente: ${existingEventos[0].nombre}`);
  }

  // 2. Insertar Alianzas (Grupos)
  console.log("Inyectando Alianzas...");
  const alianzasData = [
    { tenantId, eventoId, nombre: "Rojo (Cultura Asiática)", color: "#ef4444" },
    { tenantId, eventoId, nombre: "Negro (Romanos)", color: "#1f2937" },
    { tenantId, eventoId, nombre: "Verde (Aztecas)", color: "#22c55e" },
    { tenantId, eventoId, nombre: "Blanco (Griegos)", color: "#f8fafc" },
    { tenantId, eventoId, nombre: "Azul (Nórdicos)", color: "#3b82f6" },
    { tenantId, eventoId, nombre: "Amarillo (Egipcios)", color: "#eab308" }
  ];

  // Limpiamos grupos anteriores de este evento (opcional, por si ejecutamos 2 veces)
  await db.delete(grupos).where(eq(grupos.eventoId, eventoId));
  
  await db.insert(grupos).values(alianzasData);
  console.log(`✅ ${alianzasData.length} Alianzas creadas.`);

  // 3. Insertar Escalas de Puntaje
  console.log("Inyectando Escalas de Puntaje...");
  const escalasData = [
    { tenantId, eventoId, nombre: "Escala Z", puntajes: { "1": 20000, "2": 15000, "3": 10000, "4": 7000, "5": 5000, "6": 3000 } },
    { tenantId, eventoId, nombre: "Escala A", puntajes: { "1": 10000, "2": 8000, "3": 6000, "4": 5000, "5": 4000, "6": 2000 } },
    { tenantId, eventoId, nombre: "Escala B", puntajes: { "1": 8000, "2": 7000, "3": 5000, "4": 3000, "5": 2000, "6": 1000 } },
    { tenantId, eventoId, nombre: "Escala C", puntajes: { "1": 7000, "2": 5000, "3": 3000, "4": 2000, "5": 1000, "6": 500 } },
    { tenantId, eventoId, nombre: "Escala D", puntajes: { "1": 15000, "2": 10000, "3": 8000, "4": 6000, "5": 3000, "6": 1500 } },
    { tenantId, eventoId, nombre: "Escala PERRY", puntajes: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 } }
  ];

  await db.delete(escalasPuntaje).where(eq(escalasPuntaje.eventoId, eventoId));
  await db.insert(escalasPuntaje).values(escalasData);
  console.log(`✅ ${escalasData.length} Escalas creadas.`);

  console.log("🎉 Fase 1 completada exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});
