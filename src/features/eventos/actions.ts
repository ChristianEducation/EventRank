"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { actividades, escalasPuntaje, eventos, grupos, tenants } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

import { getEventoById, getEventoBySlug } from "./queries";
import { crearEventoSchema, editarEventoSchema, type CrearEventoInput, type EditarEventoInput } from "./schemas";
import type { Evento } from "./types";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const ERROR_GENERICO = "Ocurrió un error inesperado. Intenta de nuevo.";

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generarSlugUnico(nombre: string): Promise<string> {
  const base = slugify(nombre) || "evento";
  let slug = base;
  let intento = 1;
  while (await getEventoBySlug(slug)) {
    intento += 1;
    slug = `${base}-${intento}`;
  }
  return slug;
}

function toDateString(fecha: Date | undefined): string | undefined {
  return fecha ? fecha.toISOString().slice(0, 10) : undefined;
}

async function verificarColorPermitido(tenantId: string, colores: string[] | undefined) {
  if (!colores || colores.length === 0) return true;
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  const config = tenant?.configuracion as { personalizacion_visual?: boolean } | undefined;
  return config?.personalizacion_visual === true;
}

export async function crearEvento(input: CrearEventoInput): Promise<ActionResult<Evento>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  const parsed = crearEventoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  try {
    if (!(await verificarColorPermitido(user.tenantId, data.colores))) {
      return { success: false, error: "Tu plan no permite personalizar los colores del evento" };
    }

    const slug = await generarSlugUnico(data.nombre);
    const pinHash = data.tipoAcceso === "pin" && data.pin ? await bcrypt.hash(data.pin, 10) : null;

    const [evento] = await db
      .insert(eventos)
      .values({
        tenantId: user.tenantId,
        nombre: data.nombre,
        slug,
        estado: "borrador",
        tipoAcceso: data.tipoAcceso,
        pin: pinHash,
        imagenUrl: data.imagenUrl,
        colores: data.colores,
        fechaInicio: toDateString(data.fechaInicio),
        fechaFin: toDateString(data.fechaFin),
      })
      .returning();

    return { success: true, data: evento };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}

export async function editarEvento(eventoId: string, input: EditarEventoInput): Promise<ActionResult<Evento>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  const existing = await getEventoById(eventoId);
  if (!existing) return { success: false, error: "Evento no encontrado" };
  if (existing.estado === "finalizado") {
    return { success: false, error: "El evento está finalizado y es de solo lectura" };
  }

  const parsed = editarEventoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  try {
    if (!(await verificarColorPermitido(user.tenantId, data.colores))) {
      return { success: false, error: "Tu plan no permite personalizar los colores del evento" };
    }

    const [updated] = await db
      .update(eventos)
      .set({
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.tipoAcceso !== undefined && { tipoAcceso: data.tipoAcceso }),
        ...(data.pin !== undefined && { pin: await bcrypt.hash(data.pin, 10) }),
        ...(data.colores !== undefined && { colores: data.colores }),
        ...(data.imagenUrl !== undefined && { imagenUrl: data.imagenUrl }),
        ...(data.fechaInicio !== undefined && { fechaInicio: toDateString(data.fechaInicio) }),
        ...(data.fechaFin !== undefined && { fechaFin: toDateString(data.fechaFin) }),
      })
      .where(eq(eventos.id, eventoId))
      .returning();

    return { success: true, data: updated };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}

export async function finalizarEvento(eventoId: string): Promise<ActionResult<Evento>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  const existing = await getEventoById(eventoId);
  if (!existing) return { success: false, error: "Evento no encontrado" };
  if (existing.estado !== "activo") {
    return { success: false, error: "Solo se puede finalizar un evento activo" };
  }

  try {
    const [updated] = await db
      .update(eventos)
      .set({ estado: "finalizado" })
      .where(eq(eventos.id, eventoId))
      .returning();

    return { success: true, data: updated };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}

export async function activarEvento(eventoId: string): Promise<ActionResult<Evento>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  const existing = await getEventoById(eventoId);
  if (!existing) return { success: false, error: "Evento no encontrado" };
  if (existing.estado === "activo") return { success: true, data: existing };
  if (existing.estado === "finalizado") {
    return { success: false, error: "El evento ya está finalizado" };
  }

  try {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, existing.tenantId));
    if (!tenant) return { success: false, error: "Tenant no encontrado" };

    // MVP (RN-04): se salta el gate de pago para super_admin o tenants con plan 'interno'.
    // Cuando se habilite el flujo comercial, reemplazar esta condición por la verificación
    // de un pago confirmado en la tabla `pagos` (ver agentdocs/specs/pagos.spec.md, DIFERIDO).
    const puedeActivarSinPago = user.rol === "super_admin" || tenant.plan === "interno";
    if (!puedeActivarSinPago) {
      return { success: false, error: "Este evento requiere un pago confirmado para activarse" };
    }

    const [updated] = await db.update(eventos).set({ estado: "activo" }).where(eq(eventos.id, eventoId)).returning();

    return { success: true, data: updated };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}

export async function duplicarEvento(eventoId: string): Promise<ActionResult<Evento>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "No autenticado" };

  const original = await getEventoById(eventoId);
  if (!original) return { success: false, error: "Evento no encontrado" };

  try {
    const nuevoSlug = await generarSlugUnico(`${original.nombre} copia`);

    const [nuevoEvento] = await db
      .insert(eventos)
      .values({
        tenantId: original.tenantId,
        nombre: `${original.nombre} (copia)`,
        slug: nuevoSlug,
        estado: "borrador",
        tipoAcceso: original.tipoAcceso,
        pin: original.pin,
        imagenUrl: original.imagenUrl,
        colores: original.colores,
      })
      .returning();

    const gruposOriginales = await db.select().from(grupos).where(eq(grupos.eventoId, eventoId));
    if (gruposOriginales.length > 0) {
      await db.insert(grupos).values(
        gruposOriginales.map((g) => ({
          tenantId: g.tenantId,
          eventoId: nuevoEvento.id,
          nombre: g.nombre,
          color: g.color,
          orden: g.orden,
          activo: g.activo,
        })),
      );
    }

    const escalasOriginales = await db.select().from(escalasPuntaje).where(eq(escalasPuntaje.eventoId, eventoId));
    const escalaIdMap = new Map<string, string>();
    for (const escala of escalasOriginales) {
      const [nuevaEscala] = await db
        .insert(escalasPuntaje)
        .values({
          tenantId: escala.tenantId,
          eventoId: nuevoEvento.id,
          nombre: escala.nombre,
          puntajes: escala.puntajes,
        })
        .returning();
      escalaIdMap.set(escala.id, nuevaEscala.id);
    }

    const actividadesOriginales = await db.select().from(actividades).where(eq(actividades.eventoId, eventoId));
    if (actividadesOriginales.length > 0) {
      await db.insert(actividades).values(
        actividadesOriginales.map((a) => ({
          tenantId: a.tenantId,
          eventoId: nuevoEvento.id,
          escalaId: escalaIdMap.get(a.escalaId)!,
          nombre: a.nombre,
          descripcion: a.descripcion,
          reglas: a.reglas,
          orden: a.orden,
        })),
      );
    }

    return { success: true, data: nuevoEvento };
  } catch {
    return { success: false, error: ERROR_GENERICO };
  }
}
