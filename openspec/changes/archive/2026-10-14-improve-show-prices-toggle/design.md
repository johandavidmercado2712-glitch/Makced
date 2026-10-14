# Design

## Context

`ToggleShowPrices` (`apps/dashboard/components/ToggleShowPrices.tsx`, 59 líneas) es un Client Component con `<input type="checkbox">` nativo y estilos inline (`style={{ display: 'flex', ... }}`). Se renderiza en la cabecera de `apps/dashboard/app/productos/page.tsx:69`, dentro de un `<div style={{...}}>` que debería usar la clase `db-header-actions` (definida en `apps/dashboard/app/db-base.css:42` con responsive en :300 y :374).

El flujo de datos (verificado en solo lectura, sin cambios requeridos):
1. `productos/page.tsx:48-49` lee `diseno.mostrar_precios ?? true` vía `getTienda()`.
2. `ToggleShowPrices` POSTea `/api/settings/mostrar-precios` con `{ show }`.
3. `route.ts` valida con `requireTiendaDelUsuario()` (401/403), hace read-modify-write del JSONB `diseno`, actualiza `updated_at`.
4. Store: `getConfigDiseno()` → `combinarDiseno()` (default `mostrar_precios: true` en `packages/db/src/diseno.ts:111`) → layout (`apps/store/app/layout.tsx:54`) pasa `showPrices` a `CartProvider`; `ProductGrid.tsx:20` pasa `price={undefined}` a `ProductCard`.

Estado actual DB: `mostrar_precios = false` (verificado). Rutas del store con ISR `revalidate` 15–300s (`page.tsx:12`, `categoria/page.tsx:3`, `marcas/page.tsx:4`, etc.) → propagación aceptada como consistencia decisión del usuario.

## Goals / Non-Goals

**Goals:**
- Reescribir el UI de `ToggleShowPrices` como switch pill accesible con tokens `--db-*`.
- Cambiar el contenedor inline del header de `/productos` por `db-header-actions`.
- Verificación funcional end-to-end en implementación (persistencia + reflejo eventual en store).
- Cleanup del `setTimeout` al desmontar; `aria-busy` durante guardado.

**Non-Goals:**
- No cambiar la API route, la Server Action `requireTiendaDelUsuario`, ni el schema DB.
- No modificar el store (código) ni reducir el `revalidate` ISR.
- No alterar el contrato de `combinarDiseno` ni los defaults.

## Decisions

1. **Switch pill con CSS propio**: markup `<button role="switch" aria-checked={checked} aria-busy={loading}>` con un `<span className="toggle-precios-thumb">` animado; estilos en el CSS de la página (`productos.css`) o un `ToggleShowPrices.css` importado por el componente, usando `var(--db-btn-primary)` para el estado on y `var(--db-bg-card-hover)`/`var(--db-border)` para off. Alternativa descartada: Tailwind puro — el dashboard usa CSS files con tokens `--db-*`, no utilidades.

2. **Sin Server Actions nuevas**: la persistencia sigue por la API route existente (`/api/settings/mostrar-precios`). El componente mantiene el `fetch` actual (manejo de 401/403/5xx ya correcto); solo se envuelve el estado con `role="switch"`/`aria-*`.

3. **DB (SQL)**: ninguno. El JSONB `tiendas.diseno` ya soporta la clave.

4. **Cleanup del timeout**: guardar el id del `setTimeout` en un `useRef` y limpiar en `useEffect` return; evitar setState tras desmontar.

5. **Header**: reemplazar `<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>` por `<div className="db-header-actions">` en `productos/page.tsx` — recupera responsive heredado sin nuevo CSS.

## Flow (verificación en implementación)

```
Clic switch
  → setLoading(true), aria-busy
  → POST /api/settings/mostrar-precios {show}
  → 401/403/5xx → mensaje error, estado no alterado
  → ok → setChecked(json.mostrar_precios), "Guardado"
  → timeout 2s limpia mensaje (cleanup al desmontar)
Verificación:
  → DB: SELECT diseno->>'mostrar_precios' confirma persistencia y claves conservadas
  → Store: tras revalidate vigente (≤300s), precios ocultos en ProductGrid y carrito
```

## Risks / Trade-offs

- [El switch rediseñado cambia el layout de la cabecera] → Mitigado: se reutiliza `db-header-actions`, mismo patrón que el resto del dashboard.
- [La propagación al store puede tardar hasta 300s] → Aceptado por el usuario; el spec documenta consistencia eventual y la verificación espera la ventana.
