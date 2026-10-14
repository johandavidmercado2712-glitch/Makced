# Design

## Context

`FiltroPrecio.tsx` (171 líneas) implementa un slider custom con:
- `sliderRef` + `priceFromX` (cálculo clientX→precio)
- `handleMouseDown` / `handleTouchStart` con listeners globales en `document`
- `handleKeyDown` / `handleKeyUp` con `dirtyRef` para sync al soltar tecla
- `syncUrl` que hace `router.replace` en `startTransition` con searchParam `maxPrice`

El CSS (`FiltroPrecio.css`, 95 líneas) define `.filtro-precio` (contenedor card), `.filtro-precio-texto`, `.filtro-precio-slider`, `.filtro-precio-track`, `.filtro-precio-thumb` con hover/active states.

Consumidores: `categoriaProductos/page.tsx:45` y `marcasProductos/page.tsx:46`, ambos envueltos en `<div className="div2">` (wrapper de layout de página).

Ver proposal.md — Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Reemplazar el slider por un `<input type="number">` con `min=0`, `max=maxPrice`.
- Rediseñar el CSS del contenedor e input con los design tokens del store (`--bg-card`, `--border-color`, `--radius-md`, `--primary-mint`).
- Conservar el syncUrl existente (`router.replace` + `startTransition`, sin scroll, lógica de delete param al llegar a maxPrice).
- Reducir la superficie de código: eliminar refs y handlers de drag/touch/keyboard.

**Non-Goals:**
- No cambiar la API de props (`maxPrice: number` sigue igual).
- No cambiar el contract de URL (searchParam `maxPrice` igual).
- No tocar `div2` (wrapper de layout de página, se mantiene).
- No tocar `ProductGrid`, `ProductosPorCategoria`, ni la lógica de filtrado en server components.
- No agregar validación de rango dinámica contra productos reales (el filtro es independiente del query).

## Decisions

1. **Input numérico nativo**: se usa `<input type="number" inputMode="numeric" min={0} max={maxPrice}>`. Alternativa descartada: `<input type="text" pattern="\d+">` — pierde el spinner nativo y el teclado numérico en móvil.

2. **Evento de confirmación**: `onKeyDown` para Enter y `onBlur` para perder foco — ambos llaman a la misma lógica de sync. Esto reemplaza el patrón keydown/keyup/dirtyRef del slider. Alternativa descartada: `onChange` con debounce — introduce latencia innecesaria; el usuario espera confirmación explícita.

3. **Estado local vs URL**: se mantiene el patrón actual: `useState` para el valor visual del input, `syncUrl` al confirmar. El estado local se inicializa del `searchParams` actual (igual que ahora).

4. **Validación en el input**: si el valor es vacío, negativo, o > maxPrice al confirmar, no se navega; el input muestra el último valor válido. Se agrega un estado `error` visual sutil (borde rojo) mientras el valor es inválido.

5. **CSS del input**: el `.filtro-precio-input` hereda los tokens del store:
   - `background: var(--bg-card)`, `border: 1px solid var(--border-color)`, `border-radius: var(--radius-sm)`
   - `color: var(--text-primary)`, `font-size: 16px`
   - `:focus` → `border-color: var(--primary-mint); outline: 2px solid var(--primary-mint); outline-offset: 2px`
   - `::-webkit-outer-spin-button / ::-webkit-inner-spin-button` → `appearance: none; margin: 0` para quitar flechas nativas (se usa prefix `$` en un span al lado)
   - Ancho fijo `min-width: 120px`, `padding: 10px 14px`

6. **Server Actions**: ninguna creada ni modificada.
7. **DB (SQL)**: ningún cambio.

## Risks / Trade-offs

- [El input numérico no ofrece la "exploración" visual que daba el slider (ver el rango de precios mientras se arrastra)] → Aceptado: el usuario pidió explícitamente campo numérico; el valor actual se muestra en el texto "hasta $X" al lado.
- [Perder las flechas nativas del spinner hace que el ajuste fino dependa de escribir o usar las flechas del teclado (ArrowUp/Down del input nativo)] → Mitigado: `type="number"` ya soporta ArrowUp/Down nativamente para incrementar/decrementar; se mantiene `step={1000}` para alinearse a múltiplos de 1000.
