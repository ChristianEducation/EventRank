import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "fs";
import path from "path";
// pdf-parse will be imported dynamically
import { db } from "../src/lib/db";
import { eventos, escalasPuntaje, actividades, puntajes } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Iniciando Seed de Fase 3: Las 77 Actividades...");

  // 1. Obtener Evento y Escalas
  const existingEventos = await db.select().from(eventos).limit(1);
  if (existingEventos.length === 0) throw new Error("No hay evento creado. Ejecuta Fase 1 primero.");
  
  const eventoId = existingEventos[0].id;
  const tenantId = existingEventos[0].tenantId;

  const escalas = await db.select().from(escalasPuntaje).where(eq(escalasPuntaje.eventoId, eventoId));
  const getEscalaId = (nombre: string) => {
    const esc = escalas.find(e => e.nombre.toLowerCase() === nombre.toLowerCase());
    if (!esc) throw new Error(`Escala no encontrada: ${nombre}`);
    return esc.id;
  };

  // 2. Leer texto extraído del PDF
  const txtPath = path.join(__dirname, "pdf-text.txt");
  const text = fs.readFileSync(txtPath, "utf-8");

  // 3. Extraer sección de actividades
  // Las actividades empiezan justo en "1. Acción social" en la página 24
  const startRegex = /\n1\.\s+Acción social\s*\n/i;
  const matchStart = text.match(startRegex);
  
  if (!matchStart) throw new Error("No se encontró el inicio de las actividades en el PDF.");
  const relevantText = text.substring(matchStart.index!);

  // Cortar la parte final si hay texto basura después de la actividad 77 (la 77 es Ornamentacion de Salas)
  // Normalmente la 77 es la última.
  
  // 4. Dividir por patrón de actividad "N. Nombre"
  // Patrón: salto de línea, número del 1 al 77, punto, espacio, Nombre
  const activityRegex = /\n(?=\d{1,2}\.\s+[A-Z¿¡])/g;
  const chunks = relevantText.split(activityRegex).map(c => c.trim()).filter(c => c.length > 0);

  const recordsToInsert = [];

  for (const chunk of chunks) {
    const titleMatch = chunk.match(/^(\d{1,2})\.\s+(.+)(?:\r?\n|$)/);
    if (!titleMatch) continue;

    const num = parseInt(titleMatch[1], 10);
    const nombreRaw = titleMatch[2].trim();
    
    // Si parseamos más allá del 77, ignorar
    if (num > 77 || isNaN(num)) continue;

    // Determinar Escala
    let escalaNombre = "Escala PERRY";
    if (num <= 14) escalaNombre = "Escala Z";
    else if (num <= 20) escalaNombre = "Escala A";
    else if (num <= 41) escalaNombre = "Escala B";
    else if (num <= 52) escalaNombre = "Escala C";
    else if (num <= 59) escalaNombre = "Escala D";

    // Extraer descripción y reglas
    // Todo lo que está después del título es descripción/reglas
    let contenido = chunk.substring(titleMatch[0].length).trim();
    
    // Limpiar artefactos del PDF como el número de página suelto "\n24\n" o el header "Centro de Estudiantes\n2026"
    contenido = contenido.replace(/\n\d+\n/g, "\n"); // Números de página
    contenido = contenido.replace(/Centro de Estudiantes\s*2026/gi, ""); 

    recordsToInsert.push({
      tenantId,
      eventoId,
      escalaId: getEscalaId(escalaNombre),
      nombre: `${num}. ${nombreRaw}`,
      descripcion: `Escala asignada: ${escalaNombre}`,
      reglas: contenido,
      orden: num,
      creadoPor: "sistema"
    });
  }

  // 5. Inserción en BD
  console.log(`Se detectaron ${recordsToInsert.length} actividades para insertar...`);
  
  if (recordsToInsert.length > 0) {
    await db.delete(puntajes).where(eq(puntajes.eventoId, eventoId));
    await db.delete(actividades).where(eq(actividades.eventoId, eventoId));
    
    // Drizzle tiene límite de inyección bulk (suele ser ~65000 parámetros). 77 filas está súper bien.
    await db.insert(actividades).values(recordsToInsert);
    console.log(`✅ ${recordsToInsert.length} Actividades inyectadas con éxito.`);
  } else {
    console.log("⚠️ No se encontraron actividades válidas para insertar.");
  }

  console.log("🎉 Fase 3 completada exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});
