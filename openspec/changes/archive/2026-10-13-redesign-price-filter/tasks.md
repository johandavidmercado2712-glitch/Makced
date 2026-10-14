# Tasks

## 1. Reemplazar slider por input numérico en FiltroPrecio.tsx

- [x] 1.1 Eliminar la lógica de slider (refs `sliderRef`, `priceRef`, `dirtyRef`, handlers `handleMouseDown`, `handleTouchStart`, `handleKeyDown`, `handleKeyUp`, `priceFromX`, `applyPrice`) y reemplazar el JSX del slider por un `<input type="number" inputMode="numeric" min={0} max={maxPrice} step={1000}>` con label "hasta $X"; verificar con typecheck que no hay errores de TS

## 2. Implementar sincronización al confirmar (Enter / blur)

- [x] 2.1 Implementar `onKeyDown` (Enter) y `onBlur` que llamen a `syncUrl()` con la lógica existente (router.replace + startTransition, delete param si >= maxPrice); agregar estado `error` para valor inválido (vacío, negativo, > maxPrice) que impida la navegación; verificar con typecheck

## 3. Rediseñar CSS del filtro

- [x] 3.1 En `FiltroPrecio.css`, eliminar reglas de slider (`.filtro-precio-slider`, `.filtro-precio-track`, `.filtro-precio-thumb`) y agregar `.filtro-precio-input` con design tokens del store (--bg-card, --border-color, --radius-md, --primary-mint, focus visible, sin spinner nativo); verificar con typecheck

## 4. Verificación final

- [x] 4.1 Correr `npm run typecheck` en la raíz del monorepo y verificar 3/3 paquetes exitosos sin errores
