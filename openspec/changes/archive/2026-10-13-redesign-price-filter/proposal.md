# Proposal

## Why

El filtro de precio actual usa un slider custom (track + thumb) con lógica de drag/touch/teclado bastante pesada. Se busca simplificar la interacción a un campo numérico directo, más rápido de usar y más accesible, manteniendo la sincronización con la URL.

## What Changes

- Reemplazar el slider custom de `FiltroPrecio.tsx` por un campo de texto numérico (`<input type="number">` o equivalente) donde el usuario escribe el precio máximo.
- Rediseñar el contenedor visual (colores, bordes, tipografía, espaciado) del filtro alrededor del nuevo input, manteniendo el lenguaje de diseño del store (mint, card bg, radius).
- Eliminar la lógica de drag/touch/keyboard del slider (`handleMouseDown`, `handleTouchStart`, `handleKeyDown`, `handleKeyUp`, refs de posición).
- Mantener la sincronización existente con `searchParams` (`maxPrice` vía `router.replace` en `startTransition`).
- **BREAKING** (visual/UX): desaparece el slider; la interacción pasa a ser escritura numérica + Enter/blur.

## Capabilities

### New Capabilities

- `store/price-filter`: Interacción y comportamiento del filtro de precio máximo en páginas de productos del store (categoriaProductos, marcasProductos).

### Modified Capabilities

_(ninguna)_

## Impact

- **Archivos**: `apps/store/components/product/FiltroPrecio.tsx`, `apps/store/components/product/FiltroPrecio.css`.
- **Consumidores**: `apps/store/app/categoriaProductos/page.tsx:45`, `apps/store/app/marcasProductos/page.tsx:46`.
- **Afecta**: solo store.
- **No afecta**: dashboard, login, backend, base de datos, Server Actions.
- **Riesgo**: bajo — cambio de UI localizado; la API de props (`maxPrice`) y el contract de URL (`maxPrice` searchParam) no cambian.
