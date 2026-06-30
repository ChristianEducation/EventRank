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
    // Viernes 26
    { tenantId, eventoId, nombreActividad: "Changuita masculina", fecha: "2026-06-26", horaInicio: "14:30", horaFin: "17:00", lugar: "Cancha Central", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Pancartas", fecha: "2026-06-26", horaInicio: "14:30", horaFin: "18:00", lugar: "Cancha Techada", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Fiesta de Inicio", fecha: "2026-06-26", horaInicio: "19:00", horaFin: "23:00", lugar: "Gimnasio", jornada: "noche" },
    
    // Martes 30 - Mañana
    { tenantId, eventoId, nombreActividad: "Ceremonia de inicio", fecha: "2026-06-30", horaInicio: "08:00", horaFin: "08:15", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Encuentra a tu CES", fecha: "2026-06-30", horaInicio: "08:15", horaFin: "08:30", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Enchúlame la máquina", fecha: "2026-06-30", horaInicio: "08:30", horaFin: "09:00", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Ornamentación de salas", fecha: "2026-06-30", horaInicio: "08:30", horaFin: "09:00", lugar: "Salas", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Fifita", fecha: "2026-06-30", horaInicio: "08:30", horaFin: "09:00", lugar: "Sala de Computación", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Ping pong", fecha: "2026-06-30", horaInicio: "08:30", horaFin: "09:00", lugar: "Terraza", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Gymkana", fecha: "2026-06-30", horaInicio: "09:00", horaFin: "09:45", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Hazme reír", fecha: "2026-06-30", horaInicio: "09:45", horaFin: "10:00", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Así somos", fecha: "2026-06-30", horaInicio: "10:00", horaFin: "10:30", lugar: "Sala de artes", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Wii Sports", fecha: "2026-06-30", horaInicio: "10:00", horaFin: "10:30", lugar: "Sala de Computación", jornada: "mañana" },
    
    // Martes 30 - Tarde
    { tenantId, eventoId, nombreActividad: "Shazam", fecha: "2026-06-30", horaInicio: "12:30", horaFin: "13:15", lugar: "Cancha Central", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Rebentaso", fecha: "2026-06-30", horaInicio: "13:30", horaFin: "14:30", lugar: "Cancha Central", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Búsqueda del tesoro", fecha: "2026-06-30", horaInicio: "15:00", horaFin: "15:45", lugar: "Cancha Central", jornada: "tarde" },
    
    // Calduchos Martes (Noche)
    { tenantId, eventoId, nombreActividad: "Fonomímica", fecha: "2026-06-30", horaInicio: "18:45", horaFin: "19:00", lugar: "Cancha Central", jornada: "noche" },
    { tenantId, eventoId, nombreActividad: "Corto Netflix", fecha: "2026-06-30", horaInicio: "19:00", horaFin: "19:05", lugar: "Cancha Central", jornada: "noche" },
    { tenantId, eventoId, nombreActividad: "Batalla de bandas", fecha: "2026-06-30", horaInicio: "19:45", horaFin: "20:05", lugar: "Cancha Central", jornada: "noche" },

    // Miércoles 01 - Mañana
    { tenantId, eventoId, nombreActividad: "Changuita (Finales Masc. - Semis)", fecha: "2026-07-01", horaInicio: "08:30", horaFin: "09:00", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Fútbol Tenis", fecha: "2026-07-01", horaInicio: "08:30", horaFin: "09:00", lugar: "Gimnasio", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "VCT CSL", fecha: "2026-07-01", horaInicio: "08:30", horaFin: "09:00", lugar: "Sala de Computación", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "¿Facto o infarto?", fecha: "2026-07-01", horaInicio: "08:30", horaFin: "09:00", lugar: "Aula Magna", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "CivilizaCES", fecha: "2026-07-01", horaInicio: "09:00", horaFin: "09:30", lugar: "Sala de artes", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "¿Quieres ser milloneta?", fecha: "2026-07-01", horaInicio: "09:30", horaFin: "10:00", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Batalla de gallos", fecha: "2026-07-01", horaInicio: "10:30", horaFin: "11:00", lugar: "Escenario", jornada: "mañana" },
    
    // Miércoles 01 - Tarde
    { tenantId, eventoId, nombreActividad: "Just Dance", fecha: "2026-07-01", horaInicio: "13:00", horaFin: "13:30", lugar: "Sala ex-cielo", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "D-E-L-E-T-R-E-A-L-O", fecha: "2026-07-01", horaInicio: "13:00", horaFin: "13:30", lugar: "Aula Magna", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Jóvenes promesas", fecha: "2026-07-01", horaInicio: "13:30", horaFin: "14:00", lugar: "Cancha Central", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Damas Cracks", fecha: "2026-07-01", horaInicio: "14:30", horaFin: "15:00", lugar: "Cancha Central", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Proyecto Huevudo", fecha: "2026-07-01", horaInicio: "14:30", horaFin: "15:00", lugar: "Sala de musculación", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Teatro SL", fecha: "2026-07-01", horaInicio: "16:00", horaFin: "16:30", lugar: "Cancha Central", jornada: "tarde" },

    // Jueves 02 - Mañana
    { tenantId, eventoId, nombreActividad: "Aerochallenge", fecha: "2026-07-02", horaInicio: "08:30", horaFin: "09:00", lugar: "Oficina de JP", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Full Box", fecha: "2026-07-02", horaInicio: "08:30", horaFin: "09:00", lugar: "Sala de Computación", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Penales volteados", fecha: "2026-07-02", horaInicio: "08:30", horaFin: "09:00", lugar: "Gimnasio", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Enbiei", fecha: "2026-07-02", horaInicio: "08:30", horaFin: "09:00", lugar: "Escenario", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Sin Sentidos", fecha: "2026-07-02", horaInicio: "09:30", horaFin: "10:00", lugar: "Pasillo primer piso", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Profe disfraz", fecha: "2026-07-02", horaInicio: "10:00", horaFin: "10:30", lugar: "Cancha Central", jornada: "mañana" },
    { tenantId, eventoId, nombreActividad: "Piojo challenge", fecha: "2026-07-02", horaInicio: "11:30", horaFin: "12:00", lugar: "Cancha Central", jornada: "mañana" },
    
    // Jueves 02 - Tarde
    { tenantId, eventoId, nombreActividad: "Art Attack", fecha: "2026-07-02", horaInicio: "13:00", horaFin: "13:30", lugar: "Sala de artes", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Armaggedon", fecha: "2026-07-02", horaInicio: "13:00", horaFin: "13:30", lugar: "Cancha Central", jornada: "tarde" },
    { tenantId, eventoId, nombreActividad: "Jai kiu (Finales)", fecha: "2026-07-02", horaInicio: "14:30", horaFin: "15:00", lugar: "Gimnasio", jornada: "tarde" },


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
