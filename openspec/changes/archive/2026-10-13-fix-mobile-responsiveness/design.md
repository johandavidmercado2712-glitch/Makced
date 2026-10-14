# Design

## Context

Ver `proposal.md` (Why) para motivación. Estado relevante para decidir el cómo:

- El dashboard carga CSS por ruta: Resumen importa solo `page.css`; `/productos`, `/marcas`, `/diseno` e `/mi-tienda` importan `productos.css` como si fuera base. Ambos definen `db-header`, `db-title`, `db-btn-primary`, `db-panel`… con breakpoints distintos (640 vs 768).
- El sidebar es un riel fijo de iconos (80px, 68px a ≤1024) y `.dashboard-main` ya compensa con `margin-left` (globals.css:12 y 89-94). El ancho efectivo de contenido en un iPhone de 390px ≈ 298px.
- `--db-btn-primary` hoy: light `#047857` / dark `#4CE1AC`; los textos siguen hardcodeados en `color: white/#fff`.
- La store usa breakpoints mayormente {1024, 768, 480} con excepción de `marcas.css` (360). La navbar móvil (≤768) ya convierte `.nav-session` en tira scrolleable con scrollbar oculta, sin affordance.
- El dashboard responde 307 → login sin sesión (gate añadido en `08e0809`); la verificación visual debe autenticarse primero o inspeccionar chunks CSS compilados.
- **Server Actions creados/modificados: ninguno.** **Cambios en DB (SQL): ninguno.** **Restricción del usuario: solo se modifican archivos `.css` — ningún `.tsx`.**

```
ANTES (por ruta)                      DESPUÉS
─────────────────                     ───────
/          → page.css (db-*)          globals.css → @import db-base.css (global)
/productos → productos.css (db-*)             ↘ todas las rutas comparten db-*
/marcas    → productos.css + marcas.css        → page.css        (solo Resumen)
/diseno    → productos.css + diseno.css        → productos.css   (filtros/tabla propios)
/mi-tienda → productos.css + mi-tienda.css     → diseno.css / mi-tienda.css / marcas.css
```

## Goals / Non-Goals

**Goals:**
- Una sola fuente de verdad para las clases `db-*` compartidas, con comportamiento idéntico entre rutas (R-2).
- Breakpoints canónicos: dashboard {1024, 768, 640, 480}, store {1024, 768, 480}.
- Contraste ≥4.5:1 de controles primarios en ambos temas (R-6).
- Navbar de store móvil con affordance y targets ≥44px; `prefers-reduced-motion` en la store.

**Non-Goals:**
- Tailwind/daisyUI en el decidir (quedar documentado aparte; los imports se dejan como están).
- Hamburguesa/drawer, cambios de rutas, lógica o copy; `apps/login` intacto.
- Server Actions o SQL (ver arriba: ninguno).

## Decisions

**D1 — Archivo nuevo `apps/dashboard/app/db-base.css` importado vía `@import` en `globals.css` (CSS puro, sin tocar TSX).**
Se extraen a `db-base.css` las reglas compartidas hoy duplicadas entre `page.css` y `productos.css` (panel, header, title, subtitle, btn-primary/secondary, table panel, empty states, tags, product cell…). Como `globals.css` ya se carga en el root layout para todas las rutas, un `@import "./db-base.css";` tras los imports de Tailwind aplica el base en todas las rutas sin modificar ningún `.tsx`.
*Alternativas:* (a) importarlo en `layout.tsx` — requeriría tocar TSX, descartado por restricción del usuario; (b) declarar `productos.css` "oficialmente" base — el nombre engaña y Resumen quedaría acoplado al CSS de otra página; (c) utilities de Tailwind — non-goal. Se elige la extracción CSS-only porque es mecánica y reversible.

**D2 — Al colisionar, gana la regla más nueva y RESPONSIVE de `productos.css`.**
Donde `page.css` y `productos.css` difieren (ej. `db-header` apila a 640 vs 768), se unifica al valor canónico: apilado a ≤768 (R-2). El Resumen pierde sus particularidades solo si eran diferencias no intencionadas; las que sí son propias del Resumen (tarjetas, saludo, bestseller) se quedan en `page.css`.

**D3 — Variable `--db-btn-primary-fg`: `#FFFFFF` en `:root`, `#121212` en `.dark`.**
Se reemplaza cada `color: white|#fff` que tenga `background: var(--db-btn-primary)` por `var(--db-btn-primary-fg)`. Inventario a confirmar en implementación: `page.css:42`, `productos.css:46` y `:438`, `diseno.css:38/43` (tabs), `modalProduct.css:222` y `:394`. Los `color: white` sobre fondos con color propio (ej. círculos verde/ámbar de `diseno.css:262/317`) NO se tocan. `#121212` replica el texto que usa el store sobre menta (`verProducto.css:249`).

**D4 — Affordance CSS puro en `.nav-session` (sin JS).**
`position: relative` + `::before`/`::after` con degradado de 24px desde el color de fondo de la navbar hacia transparente en cada borde, `pointer-events: none`; `scroll-snap-type: x proximity` en el contenedor y `scroll-snap-align: start` en los links; a ≤480, links con `min-height: 44px`.
*Alternativas:* hamburger/drawer (componente cliente + estado + overlay + aria — más invasivo, innecesario porque la tira ya es usable); dots indicadores (chrome extra). Se elige CSS-only: cero riesgo de regresión funcional.

**D5 — Bloque global en `apps/store/app/globals.css`:**
```css
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal { opacity: 1; transform: none; transition: none; }
}
```
Mantiene el hook `useScrollReveal` intacto (agregar/ quitar clases sin efecto visual).

**D6 — Sidebar: `height: 100vh;` seguido de `height: 100dvh;` (cascade trick) y eliminar la línea `min-height: 100dvh` redundante.** Fallback para engines sin `dvh`.

**D7 — Mapeo de breakpoints:**
| Hoy | Pasa a | Dónde |
|-----|--------|-------|
| 380 (tarjetas Resumen) | 640 | page.css → la grilla baja a 1 col con el riel ya descontado |
| 360 (marcas store) | 480 | marcas.css |
| 900/520 (login) | se quedan | apps/login — fuera de alcance |

## Risks / Trade-offs

- [Consolidar `db-base.css` altera visuals sutiles por ruta] → Matriz de verificación obligatoria: 5 rutas × {390, 480, 768, 1024} comparando antes/después (screenshots o inspección); diff de reglas eliminadas para confirmar equivalencia.
- [El gate 307 de auth impide curl visual] → Login una vez con cookie jar de curl (`/api/auth` del dashboard) o verificar por CSS chunks compilados en `.next/dev/static/chunks` + revisión manual autenticada.
- [Tailwind preflight convive con el CSS a mano] → `db-base.css` define explícitamente todo lo que usa (no depende de defaults de reset); no se agregan utilities.
- [Degradados de la navbar dependen del color de fondo] → Usar el mismo color/variable del fondo de `.nav-icon`/`.nav-session` en ambos temas; probar light y dark.
- [Unificar `db-header` a ≤768 "retrasa" el apilado del Resumen (antes 640)] → Aceptado: comportamiento único manda (R-2); a 641-767px el Resumen queda con header apilado igual que el resto, coherente.

## Migration Plan

Cambio de solo frontend: un solo PR/commit, deploy normal. Rollback = `git revert` (sin datos ni contratos que migrar). Orden sugerido: D3 (independiente, bajo riesgo) → D1/D2 (consolidación) → D7 (breakpoints) → store (D4/D5 + 360→480) → D6.

## Open Questions

Ninguna bloqueante: el umbral de tarjetas (640), el color de texto dark (`#121212`) y la estrategia de affordance (CSS-only) están decididos arriba.
