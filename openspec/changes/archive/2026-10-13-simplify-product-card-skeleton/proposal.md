# Proposal

## Why

El estado de carga del `ProductCard` en el store reproduce la estructura exacta de la card real (wrapper de imagen + fila flex de marca/nombre + precio), lo que genera un skeleton complejo y acoplado al layout. Se necesita un esqueleto más simple y genérico (imagen + 3 líneas de texto) que sea más limpio visualmente y más fácil de mantener.

## What Changes

- Reemplazar el JSX del estado `loading` en `ProductCard.tsx` (líneas 19-33) por un patrón simplificado de daisyUI: un bloque `flex flex-col gap-4` con un `skeleton` de imagen (`h-32 w-full`) y tres `skeleton` de líneas de texto (`h-4` con anchos variados).
- El skeleton se adapta al grid actual (`Productos-cards`) en lugar de usar un ancho fijo `w-52`.
- Se elimina la dependencia de la estructura interna real (`.product-image-wrapper`, `.product-content`, `.product-marca`, `.product-nombre`, `.product-precio-fila`) dentro del estado de loading.

## Capabilities

### New Capabilities

- `store/product-card-loading`: Comportamiento del esqueleto de carga mostrado mientras se resuelve el contenido de una card de producto en el store (fallback de Suspense en home, categoriaProductos, marcasProductos).

### Modified Capabilities

_(ninguna)_

## Impact

- **Archivos**: `apps/store/components/product/ProductCard.tsx` (rama `if (loading)`), posiblemente `apps/store/components/product/ProductCard.css` (reglas `.loading` si ya no son necesarias).
- **Afecta**: solo store.
- **No afecta**: dashboard, login, backend, base de datos, Server Actions.
- **Riesgo**: bajo — cambio puramente visual en un fallback de carga; no toca datos ni lógica.
