import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { reglasGenerales, eventos } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Iniciando Seed de Fase 2: Reglamento General...");

  // Obtener Evento
  const existingEventos = await db.select().from(eventos).limit(1);
  if (existingEventos.length === 0) {
    throw new Error("No hay evento creado. Ejecuta Fase 1 primero.");
  }
  const eventoId = existingEventos[0].id;
  const tenantId = existingEventos[0].tenantId;

  const reglasData = [
    {
      tenantId,
      eventoId,
      titulo: "1. Objetivos del Aniversario",
      categoria: "General",
      orden: 1,
      visible: true,
      contenido: `Objetivo general:
Celebrar y honrar el aniversario número 110 del colegio con la comunidad sanluisina, incentivando la participación de los y las estudiantes del 3er ciclo junto a profesores, funcionarios y administrativos, generando así un ambiente sano, respetuoso, íntegro y justo.

Objetivos específicos:
- Otorgarle al estudiantado 3 días de recreación y desarrollo personal con el fin de potenciar sus habilidades y talentos.
- Llevar a cabo actividades creativas e intelectuales para descubrir nuevos talentos.
- Incentivar un ambiente íntegro, de respeto y de sana convivencia.
- Fortalecer la relación y unión entre la comunidad sanluisina trabajando en equipo.
- Fomentar el sentido de identidad de los y las estudiantes.`
    },
    {
      tenantId,
      eventoId,
      titulo: "2. Participantes y Estudiantes",
      categoria: "Participantes",
      orden: 2,
      visible: true,
      contenido: `1. Únicamente los y las estudiantes que pertenezcan al tercer ciclo del colegio, desde 7° básico a IV medio, podrán participar en el Aniversario con una cuota que será cobrada a las alianzas. Esta cuota debe ser prudente, sin afectar la convivencia y medios económicos de las familias.

2. Cuando en una actividad se menciona una participación “equitativa” se hace referencia a una cantidad de 60% del curso mayor y un 40% del curso menor. Todas las actividades del aniversario tendrán esta regla a menos de que se indique lo contrario.

3. Nadie que supere cuarto año de enseñanza media y esté fuera de la educación diurna podrá participar representando a la alianza, a menos que la actividad lo requiera y sea especificado en el detalle de cada competencia.`
    },
    {
      tenantId,
      eventoId,
      titulo: "3. Delegados de Alianza",
      categoria: "Participantes",
      orden: 3,
      visible: true,
      contenido: `Cada alianza debe de presentar dos delegados de alianza (uno de cada curso), ellos asumirán la responsabilidad de cada acto realizado por su alianza.

1. Los delegados de cada alianza deberán participar en TODA reunión que el CES convoque previamente y durante el aniversario.
2. Los delegados podrán presentarse todos los días de aniversario con un margen máximo de 20 minutos después del término de las actividades para entregar a su respectivo encargado por medio de un correo electrónico dirigido a la cuenta del CES, con copia al respectivo encargado/a de alianza, quejas y/o preguntas. Se podrán realizar apelaciones, excepto en el caso de las decisiones de los árbitros.
3. Los delegados de alianza son los únicos autorizados para hacer reclamos al CES y proponer cambios, exclusivamente por escrito.`
    },
    {
      tenantId,
      eventoId,
      titulo: "4. Sanciones Generales y Descalificaciones",
      categoria: "Sanciones",
      orden: 4,
      visible: true,
      contenido: `Expulsión:
Si un miembro del CES o terceros imparciales (asesores, jurados, árbitros u otros) es agredido física, verbalmente o de cualquier otra forma, el agresor(a) será expulsado del aniversario o de la actividad, y serán descontados a su alianza un puntaje predefinido con 30.000 puntos en contra.

I. No presentación:
La falta de presentación en una de las actividades será sancionada con el descuento de máximo puntaje de la actividad correspondiente.

II. Horarios:
Diez minutos antes de cada actividad serán avisadas las alianzas mediante los delegados. Se esperarán sólo cinco minutos posteriores a la hora establecida para la presentación. La tardanza será penalizada con 5.000 puntos.

III. Descalificación:
Toda descalificación de la alianza en una actividad será contada como una NO participación impidiendo la suma de puntos en dicha actividad.

IV. Drogas e Ilegalidades:
Cualquier persona que sea sorprendida ingiriendo alcohol o consumiendo cualquier tipo de drogas, será expulsada del aniversario con descuento de 30.000 puntos a su alianza.`
    },
    {
      tenantId,
      eventoId,
      titulo: "5. Uso de Celulares",
      categoria: "Normas",
      orden: 5,
      visible: true,
      contenido: `1. El uso de celulares durante las actividades de aniversario desarrolladas dentro del horario escolar está permitido exclusivamente a los integrantes del Centro de Estudiantes, los delegados de alianza y los presidentes de curso.
2. Su uso tendrá como único propósito la comunicación y coordinación de actividades oficiales del aniversario.
3. La restricción del uso de celulares para los demás integrantes de alianza solo se levantará cuando una actividad lo requiera y se retomará al finalizar la misma.
4. En caso de que un integrante de la alianza sea sorprendido utilizando su dispositivo móvil sin justificación alguna, este será requisado por funcionarios del establecimiento y se descontarán 1.000 puntos por cada uno.`
    },
    {
      tenantId,
      eventoId,
      titulo: "6. Vestimenta",
      categoria: "Normas",
      orden: 6,
      visible: true,
      contenido: `1. Poleras: Durante las distintas actividades, los participantes deberán vestir obligatoriamente una polera que los identifique con el color de su alianza. Esta deberá ser usada en todas las pruebas y actividades exceptuando las nocturnas (calduchos) y audiovisuales.

2. Poleras inadecuadas: Se descalificará y descontará puntaje, dependiendo la gravedad, a aquellos miembros de alianza que utilicen vestimentas que atenten contra la ética y moral del colegio o hagan alusión a insultos y/o groserías.`
    },
    {
      tenantId,
      eventoId,
      titulo: "7. Reclamos",
      categoria: "Reclamos",
      orden: 7,
      visible: true,
      contenido: `1. Los reclamos deben ser presentados al CES, sólo mediante correo electrónico (ces@colegiosanluis.cl) o en las reuniones con los delegados, entre las 09:00 y las 21:00 hrs. La respuesta se dará a más tardar a las 10:00 hrs del día siguiente.
2. Las decisiones de jueces y árbitros son inapelables.
3. Todo reclamo que constituya alguna falta de respeto o incluya gritos dirigidos hacia el CES o algún jurado será sancionado con un descuento mínimo de 10.000 puntos.
4. Los reclamos de la alianza deben ser realizados únicamente cuando la alianza se vea perjudicada.`
    },
    {
      tenantId,
      eventoId,
      titulo: "8. Entrega de Materiales Audiovisuales",
      categoria: "General",
      orden: 8,
      visible: true,
      contenido: `1. Para todas las pruebas que requieran material audiovisual, la alianza deberá entregarlo al encargado de su alianza en un pendrive en blanco debidamente marcado.
2. El formato de las fotografías será digital (en el pendrive) y físico (13x15cm). Ambas a color.
3. El uso de Inteligencia Artificial (IA) para la creación de videos/fotos está estrictamente prohibido y significa descuento de puntaje máximo más 10.000 puntos extra.`
    }
  ];

  await db.delete(reglasGenerales).where(eq(reglasGenerales.eventoId, eventoId));
  await db.insert(reglasGenerales).values(reglasData);
  console.log(`✅ ${reglasData.length} Reglas Generales inyectadas.`);

  console.log("🎉 Fase 2 completada exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});
