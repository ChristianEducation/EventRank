# EventRank — Dirección de Diseño

> Esta guía da un norte visual. La **skill `ui-ux-pro-max` es la autoridad final** en
> decisiones de diseño: paletas, tipografía, espaciado, accesibilidad e interacción. Antes de
> construir cualquier UI, el agente consulta la skill. Esta guía solo fija la intención de
> marca y las reglas no negociables.

---

## Uso obligatorio de la skill

**Para CUALQUIER trabajo de UI** (landing, dashboard, formularios, portal público, ranking,
componentes), el agente DEBE:

1. Activar e invocar la skill `ui-ux-pro-max` **antes** de implementar.
2. Usar su generador de design system para definir paleta, tipografía y tokens.
3. Pasar cada pantalla por su auditoría (contraste, focus states, touch targets, loading
   states, responsive) **antes** de darla por terminada.
4. Probar en 375px (móvil chico) — el portal público se ve mayoritariamente en celular.

Stack a indicarle a la skill: **Next.js + Tailwind + shadcn/ui**.

---

## Intención de marca (input para la skill)

EventRank es **el marcador oficial en vivo** de un evento competitivo escolar/universitario.
Debe sentirse:

- **Energético y competitivo** — es una competencia; el ranking es el héroe de la pantalla.
- **Claro y rápido** — legible de un vistazo, en movimiento, desde el celular.
- **Confiable pero juvenil** — para colegios y centros de estudiantes, no corporativo gris.
- **Sin fricción para el organizador** — el dashboard se usa bajo presión durante el evento.

Palabras clave para el generador de design system de la skill:
`SaaS`, `dashboard`, `real-time leaderboard`, `mobile-first`, `youthful`, `energetic`,
`high-contrast`, `clear hierarchy`.

---

## Reglas no negociables (independientes de lo que elija la skill)

1. **Mobile-first.** El portal público funciona perfecto desde 375px. Se diseña primero para
   móvil, luego se expande.
2. **El ranking es el héroe.** En el portal, la tabla de posiciones domina visualmente:
   jerarquía clara de 1°/2°/3°, color por grupo, puntaje grande y legible.
3. **Estados "en vivo" visibles.** Indicador claro de tiempo real (ej: badge "En vivo" con
   pulso). El usuario debe saber que lo que ve se está actualizando solo.
4. **Color por grupo consistente.** Cada grupo tiene su color (definido por el organizador) y
   ese color lo identifica en TODA la app (ranking, actividades, badges).
5. **Accesibilidad mínima:** contraste AA, touch targets ≥ 44px, focus states visibles,
   `prefers-reduced-motion` respetado en las animaciones del ranking.
6. **Sin emojis como íconos de sistema.** Usar íconos SVG (lucide-react) para navegación y
   controles. Emojis solo en contenido, no en UI estructural.
7. **Loading states y skeletons** en todas las vistas que cargan datos. Nada de pantallas en
   blanco mientras carga.
8. **Dark mode** deseable en el portal público (los eventos suelen ser de noche / en gimnasios
   con proyección). Validar contraste de dark mode por separado.

---

## Pantallas críticas (donde el diseño importa más)

| Pantalla | Prioridad de diseño | Nota |
|----------|---------------------|------|
| Portal público — ranking | 🔴 Máxima | Es la cara del producto. Tiempo real, móvil, héroe visual. |
| Landing | 🔴 Alta | Primera impresión, convierte. Mobile-first (llegan de IG/WhatsApp). |
| Dashboard — ingreso de puntajes | 🟠 Alta | Se usa bajo presión. Rápido, pocos clics, sin errores. |
| Dashboard — gestión de evento | 🟡 Media | Funcional y claro. Formularios limpios. |
| Auth (Clerk) | 🟢 Baja | Clerk lo provee; aplicar el theme `shadcn` de `@clerk/ui`. |

---

## Coherencia con Clerk

Clerk maneja las pantallas de auth. Para que se vean parte de EventRank:
```tsx
import { shadcn } from '@clerk/ui/themes'
<ClerkProvider appearance={{ theme: shadcn }}>
```
Y ajustar el color de acento del theme de Clerk para que matchee la paleta que defina la skill.

---

## Flujo de trabajo de diseño por feature

Para cada feature con UI, el agente:
1. Lee el spec de la feature en `specs/`.
2. Invoca `ui-ux-pro-max` con la intención de marca de arriba + el tipo de pantalla.
3. Implementa siguiendo lo que la skill recomienda (tokens, componentes, patrones).
4. Corre la auditoría de la skill (accesibilidad + anti-patrones) antes de cerrar el task.
5. Verifica en 375px y en dark mode.
