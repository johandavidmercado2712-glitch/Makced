# Design

## Context

`ProductCard.tsx` (apps/store/components/product/ProductCard.tsx:19-33) tiene una rama `if (loading)` que devuelve un skeleton replicando la estructura real de la card: `.product-image-wrapper` con `skeleton h-full w-full`, luego `.product-content` con una fila flex (marca + nombre) y un precio. Ese JSX se consume como fallback de `Suspense` en `page.tsx:82`, `categoriaProductos/page.tsx:46` y `marcasProductos/page.tsx:47` vía `ProductGridSkeleton`.

El CSS asociado (`ProductCard.css:161-169`) define `.Productos-card.loading { pointer-events: none }` y `.Productos-card.loading .product-content { flex-col gap:0 }` — la segunda regla queda huérfana si el nuevo skeleton no usa `.product-content`.

La prop `className` (default `"Productos-card"`) es la que ancla la card al grid `Productos-cards` (max-width 280px, margin auto, width 100%), por lo que reutilizarla en el wrapper del skeleton garantiza que llene la celda del grid sin forzar un ancho fijo.

Ver proposal.md — Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Reemplazar el estado `loading` de `ProductCard` por un skeleton simplificado: bloque de imagen + 3 líneas de texto, usando clases `skeleton` de daisyUI.
- Mantener la adaptación al grid `Productos-cards` reutilizando la prop `className` en el wrapper.
- Eliminar el JSX muerto y las reglas CSS huérfanas asociadas al skeleton viejo.

**Non-Goals:**
- No tocar `ProductGridSkeleton.tsx` (solo orilla el mismo `ProductCard loading`).
- No cambiar la card real (no-loading) ni sus estilos.
- No tocar otros componentes de loading (FiltroPrecio pending, etc.).
- No introducir dependencias nuevas (daisyUI ya está configurado en el store).

## Decisions

1. **Wrapper del skeleton**: se conserva `<div className={\`${className} loading\`}>` como raíz del estado de carga. `className` (default `Productos-card`) aporta el sizing del grid; la clase `loading` aporta `pointer-events: none` para que no sea clickeable.
   - *Alternativa descartada*: devolver un `div` suelto con `w-52` fijo (el patrón literal del usuario) — descartada porque no se adaptaría al grid responsivo (el usuario pidió "Adaptar al grid").

2. **Estructura interna del skeleton** (nueva):
   ```
   <div className={className + " loading"}>
     <div className="skeleton h-32 w-full" />   // imagen
     <div className="skeleton h-4 w-28" />       // título corto
     <div className="skeleton h-4 w-full" />     // línea 1
     <div className="skeleton h-4 w-full" />     // línea 2
   </div>
   ```
   El wrapper lleva un `flex flex-col gap-4 p-4` (o similar) para espaciado uniforme. La imagen usa `h-32` (no `h-full` como antes) según el patrón pedido — es un esqueleto genérico, no una réplica 1:1 de la card real.

3. **Limpieza CSS**: eliminar la regla `.Productos-card.loading .product-content` de `ProductCard.css` (queda huérfana). Conservar `.Productos-card.loading { pointer-events: none }`.

4. **Server Actions**: ninguna creada ni modificada.
5. **DB (SQL)**: ningún cambio.

## Risks / Trade-offs

- [El skeleton `h-32` es más bajo que la imagen real (aspect-ratio 1:1, hasta 280px)] → Aceptado: es el patrón pedido; el shift al cargar es mínimo y propio de los skeletons simplificados.
- [Al quitar `.product-content` del loading, si en el futuro se reintroduce la estructura vieja, la regla CSS ya no existirá] → Bajo riesgo: es trivial reintroducirla si fuera necesario.
