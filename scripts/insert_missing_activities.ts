import { db } from '../src/lib/db';
import { actividades } from '../src/lib/db/schema';
import crypto from 'crypto';

const tenantId = "ee703078-3511-4063-b5c2-4dbf59f60d4a";
const eventoId = "d78fb8b2-bfcb-472b-9e18-47a7826762ed";

const missingActivities = [
  {
    id: crypto.randomUUID(),
    tenantId,
    eventoId,
    escalaId: "61aae5d8-3db5-4e08-abc2-c846c8bb2f6a", // Escala B
    nombre: "24. rebentaso",
    descripcion: "Escala asignada: Escala B",
    orden: 24,
    reglas: `Condiciones:
● Se deben presentar 10 integrantes por alianza distribuidos de manera equitativa y 1 profesor/funcionario.
● Deben girar una cantidad de 8 vueltas (“Posta borracha”) y luego reventar un globo solamente con el abdomen sobre una colchoneta.
● La alianza que concrete la actividad en menos tiempo será la ganadora.
● El profesor tendrá la posibilidad de hacer una pirueta para reventar el globo y ganar una bonificación de 2.000 puntos.
● Solo 3 participantes por alianza tendrán la oportunidad de reventar el globo de forma extrema. Estos serán bonificados con 1.000 puntos.

Sanciones:
● Reventar el globo con otra parte que no sea el abdomen será sancionado con 1.000 puntos de descuento.
● La no presentación a la actividad tendrá un descuento de 8.000 puntos.
● La utilización de materiales, sea con filo o no, para explotar el globo, conlleva un descuento de 2.000 puntos.`
  },
  {
    id: crypto.randomUUID(),
    tenantId,
    eventoId,
    escalaId: "655ce94a-dbc2-4249-a33e-bbf0d6eea5db", // Escala C
    nombre: "45. full box",
    descripcion: "Escala asignada: Escala C",
    orden: 45,
    reglas: `Condiciones:
● Consiste en un torneo de “Fortnite”
● Cada alianza deberá presentar 2 participantes (1 de la mayor y 1 de la menor)
● Se jugará en un mapa creativo que será anunciado por el CES al momento de jugar.
● Formato “llave de clasificación”
● Cada participante deberá llevar su propio computador para jugar

Sanciones:
● Si algún jugador es sorprendido utilizando cualquier tipo de ventaja o trampa contra su contrincante, la alianza será inmediatamente descalificada y obtendrá una sanción de 8.000 puntos.
● La no presentación a esta actividad tendrá un descuento de 7.000 puntos.`
  },
  {
    id: crypto.randomUUID(),
    tenantId,
    eventoId,
    escalaId: "0707f0f1-7ebe-4042-8864-1d2c2c2f573f", // Escala D
    nombre: "56. enbiei",
    descripcion: "Escala asignada: Escala D",
    orden: 56,
    reglas: `Condiciones:
● Consistirá en un torneo de basketball.
● Formato "llave de clasificación".
● Se jugará en dos categorías masculina y femenina, en ambas categorías se siguen las misma condiciones y sanciones.
● El equipo estará compuesto por 5 integrantes
● 3 integrantes en banca como máximo.
● Los partidos se jugarán en 2 tiempos, cada uno de 10 minutos con un descanso de 2 minutos.
● Cada equipo cuenta con 1 timeout.
● Las decisiones del árbitro son INAPELABLES.
● Se deberán presentar con la polera de color de la alianza y short o calza deportiva.
● Si todos los/las integrantes en cancha, llevan puesta una polera de la NBA con su color respectivo, significará una bonificación de 6.000 puntos.

Sanciones:
● Los participantes que sean sorprendidos con una actitud antideportiva (insultos, golpes, etc.) serán penalizados con un descuento de 5.000 puntos.
● Si la barra de una alianza emite insultos hacia alguno de los jugadores o hacia miembros del CES, será penalizada con 5.000 puntos.
● La no presentación a esta actividad tendrá un descuento de 10.000 puntos.`
  }
];

async function run() {
  try {
    console.log("Insertando actividades faltantes...");
    await db.insert(actividades).values(missingActivities);
    console.log("¡Actividades insertadas exitosamente!");
    process.exit(0);
  } catch (err) {
    console.error("Error insertando actividades:", err);
    process.exit(1);
  }
}

run();
