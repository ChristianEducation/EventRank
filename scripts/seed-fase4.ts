import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { eventos, horarios } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Iniciando Seed de Fase 4: Cronograma de Horarios...");

  const existingEventos = await db.select().from(eventos).limit(1);
  if (existingEventos.length === 0) throw new Error("No hay evento creado.");
  
  const eventoId = existingEventos[0].id;
  const tenantId = existingEventos[0].tenantId;

  // Fecha base para pruebas (usaremos fechas de la misma semana para verlas juntas)
  // Viernes 26 = 2026-06-26
  // Martes 30 = 2026-06-30
  // Miercoles 01 = 2026-07-01
  // Jueves 02 = 2026-07-02
  
  const horariosData = [
    { tenantId, eventoId, nombreActividad: "Changuita masculina", fecha: "2026-06-26", horaInicio: "14:30", horaFin: "17:00", lugar: "Cancha Central", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Pancartas", fecha: "2026-06-26", horaInicio: "14:30", horaFin: "18:00", lugar: "Cancha Techada", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Fiesta de Inicio", fecha: "2026-06-26", horaInicio: "19:00", horaFin: "23:00", lugar: "Gimnasio", jornada: "noche" },
    
    // Martes 30
    { tenantId, eventoId, nombreActividad: "Ceremonia de inicio", fecha: "2026-06-30", horaInicio: "08:00", horaFin: "08:15", lugar: "Salas", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Encuentra a tu CES", fecha: "2026-06-30", horaInicio: "08:15", horaFin: "08:30", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Gymkana", fecha: "2026-06-30", horaInicio: "09:00", horaFin: "09:45", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Ping Pong", fecha: "2026-06-30", horaInicio: "08:30", horaFin: "10:30", lugar: "Terraza", jornada: "mañana" },
    
    // Calduchos Martes (Noche)
    { tenantId, eventoId, nombreActividad: "Calducho 1 - Fonomímica", fecha: "2026-06-30", horaInicio: "18:45", horaFin: "19:40", lugar: "Cancha Central", jornada: "noche" },
    { tenantId, eventoId, nombreActividad: "Calducho 1 - Batalla de bandas", fecha: "2026-06-30", horaInicio: "19:45", horaFin: "21:15", lugar: "Cancha Central", jornada: "noche" },

    // Miércoles 01
    { tenantId, eventoId, nombreActividad: "Changuita (Finales)", fecha: "2026-07-01", horaInicio: "08:30", horaFin: "11:30", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Fútbol Tenis", fecha: "2026-07-01", horaInicio: "08:30", horaFin: "11:30", lugar: "Gimnasio", jornada: "mañana" },
    
    // Jueves 02
    { tenantId, eventoId, nombreActividad: "Aerochallenge", fecha: "2026-07-02", horaInicio: "08:30", horaFin: "10:00", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Penales volteados", fecha: "2026-07-02", horaInicio: "08:30", horaFin: "10:00", lugar: "Gimnasio", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Calducho 2 - Cheer masculino", fecha: "2026-07-02", horaInicio: "20:30", horaFin: "21:30", lugar: "Cancha Central", jornada: "noche" },
  ];

  await db.delete(horarios).where(eq(horarios.eventoId, eventoId));
  await db.insert(horarios).values(horariosData);
  console.log(`✅ ${horariosData.length} Horarios inyectados.`);

  console.log("🎉 Fase 4 completada exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});
