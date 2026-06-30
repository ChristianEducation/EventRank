import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull(), // 'basico' | 'pro' | 'federacion' | 'interno'
  configuracion: jsonb("configuracion").notNull(),
  emailContacto: text("email_contacto").notNull(),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const eventos = pgTable(
  "eventos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    nombre: text("nombre").notNull(),
    slug: text("slug").notNull().unique(),
    estado: text("estado").notNull().default("borrador").$type<"borrador" | "activo" | "finalizado">(),
    tipoAcceso: text("tipo_acceso").notNull().$type<"publico" | "pin">(),
    pin: text("pin"),
    imagenUrl: text("imagen_url"),
    colores: jsonb("colores").$type<string[]>(),
    fechaInicio: date("fecha_inicio"),
    fechaFin: date("fecha_fin"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("eventos_tenant_id_idx").on(table.tenantId)],
);

export const grupos = pgTable(
  "grupos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    eventoId: uuid("evento_id").notNull().references(() => eventos.id, { onDelete: "cascade" }),
    nombre: text("nombre").notNull(),
    color: text("color"),
    orden: integer("orden").notNull().default(0),
    activo: boolean("activo").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("grupos_tenant_id_idx").on(table.tenantId),
    index("grupos_evento_id_idx").on(table.eventoId),
  ],
);

export const escalasPuntaje = pgTable(
  "escalas_puntaje",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    eventoId: uuid("evento_id").notNull().references(() => eventos.id, { onDelete: "cascade" }),
    nombre: text("nombre").notNull(),
    puntajes: jsonb("puntajes").notNull(), // { "1": 100, "2": 80, ... }
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("escalas_puntaje_tenant_id_idx").on(table.tenantId),
    index("escalas_puntaje_evento_id_idx").on(table.eventoId),
  ],
);

export const actividades = pgTable(
  "actividades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    eventoId: uuid("evento_id").notNull().references(() => eventos.id, { onDelete: "cascade" }),
    escalaId: uuid("escala_id").notNull().references(() => escalasPuntaje.id),
    nombre: text("nombre").notNull(),
    descripcion: text("descripcion"),
    reglas: text("reglas"),
    orden: integer("orden").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("actividades_tenant_id_idx").on(table.tenantId),
    index("actividades_evento_id_idx").on(table.eventoId),
    index("actividades_escala_id_idx").on(table.escalaId),
  ],
);

export const puntajes = pgTable(
  "puntajes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    eventoId: uuid("evento_id").notNull().references(() => eventos.id, { onDelete: "cascade" }),
    actividadId: uuid("actividad_id").notNull().references(() => actividades.id),
    grupoId: uuid("grupo_id").notNull().references(() => grupos.id),
    lugar: integer("lugar").notNull(),
    puntajeBase: integer("puntaje_base").notNull(),
    comodin: boolean("comodin").notNull().default(false),
    bonificacion: integer("bonificacion").notNull().default(0),
    sancion: integer("sancion").notNull().default(0),
    puntajeFinal: integer("puntaje_final").notNull(),
    publico: boolean("publico").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("puntajes_tenant_id_idx").on(table.tenantId),
    index("puntajes_evento_id_idx").on(table.eventoId),
    index("puntajes_actividad_id_idx").on(table.actividadId),
    index("puntajes_grupo_id_idx").on(table.grupoId),
  ],
);

export const horarios = pgTable(
  "horarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    eventoId: uuid("evento_id").notNull().references(() => eventos.id, { onDelete: "cascade" }),
    nombreActividad: text("nombre_actividad").notNull(),
    fecha: date("fecha").notNull(),
    horaInicio: time("hora_inicio").notNull(),
    horaFin: time("hora_fin"),
    lugar: text("lugar"),
    jornada: text("jornada"), // 'mañana' | 'tarde' | 'noche'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("horarios_tenant_id_idx").on(table.tenantId),
    index("horarios_evento_id_idx").on(table.eventoId),
  ],
);

export const reglasGenerales = pgTable(
  "reglas_generales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    eventoId: uuid("evento_id").notNull().references(() => eventos.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    contenido: text("contenido").notNull(),
    categoria: text("categoria"),
    orden: integer("orden").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("reglas_generales_tenant_id_idx").on(table.tenantId),
    index("reglas_generales_evento_id_idx").on(table.eventoId),
  ],
);

export const pagos = pgTable(
  "pagos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
    eventoId: uuid("evento_id").notNull().references(() => eventos.id, { onDelete: "cascade" }),
    plan: text("plan").notNull(),
    monto: integer("monto").notNull(),
    estado: text("estado").notNull(), // 'pendiente' | 'pagado' | 'rechazado'
    proveedor: text("proveedor").notNull(), // 'flow' | 'khipu'
    referencia: text("referencia"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("pagos_tenant_id_idx").on(table.tenantId),
    index("pagos_evento_id_idx").on(table.eventoId),
  ],
);
