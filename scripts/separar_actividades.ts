import { db } from '../src/lib/db';
import { actividades } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const changuitaId = "d2a08e3c-3ae9-4c24-b633-ca374ec4647a";
const enbieiId = "8bd44a5c-3fce-4e3c-9a8f-99093f80dc82";
const jaikiuId = "8ac5598e-bf7a-48a9-834e-8782f1e334d4";

async function run() {
  try {
    console.log("Iniciando migración...");

    // 1. Obtener las 3 actividades actuales para copiar sus datos exactos
    const [changuita] = await db.select().from(actividades).where(eq(actividades.id, changuitaId));
    const [enbiei] = await db.select().from(actividades).where(eq(actividades.id, enbieiId));
    const [jaikiu] = await db.select().from(actividades).where(eq(actividades.id, jaikiuId));

    if (!changuita || !enbiei || !jaikiu) {
      throw new Error("No se encontraron las actividades originales.");
    }

    // 2. Renombrar las actividades originales (Update)
    await db.update(actividades).set({ nombre: "55. Changuita Masculina" }).where(eq(actividades.id, changuitaId));
    await db.update(actividades).set({ nombre: "56. Enbiei Masculino" }).where(eq(actividades.id, enbieiId));
    await db.update(actividades).set({ nombre: "57. Jaikiu Masculino" }).where(eq(actividades.id, jaikiuId));

    // 3. Crear las 3 actividades nuevas (Femeninas) con la misma configuración
    const nuevasActividades = [
      {
        id: crypto.randomUUID(),
        tenantId: changuita.tenantId,
        eventoId: changuita.eventoId,
        escalaId: changuita.escalaId,
        nombre: "55. Changuita Femenina",
        descripcion: changuita.descripcion,
        reglas: changuita.reglas,
        orden: changuita.orden
      },
      {
        id: crypto.randomUUID(),
        tenantId: enbiei.tenantId,
        eventoId: enbiei.eventoId,
        escalaId: enbiei.escalaId,
        nombre: "56. Enbiei Femenino",
        descripcion: enbiei.descripcion,
        reglas: enbiei.reglas,
        orden: enbiei.orden
      },
      {
        id: crypto.randomUUID(),
        tenantId: jaikiu.tenantId,
        eventoId: jaikiu.eventoId,
        escalaId: jaikiu.escalaId,
        nombre: "57. Jai kiu Femenino",
        descripcion: jaikiu.descripcion,
        reglas: jaikiu.reglas,
        orden: jaikiu.orden
      }
    ];

    await db.insert(actividades).values(nuevasActividades);

    console.log("¡Migración completada exitosamente!");
    process.exit(0);
  } catch (err) {
    console.error("Error en la migración:", err);
    process.exit(1);
  }
}

run();
