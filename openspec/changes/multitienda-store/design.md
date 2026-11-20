# Design

## Context

Ver `proposal.md - Why`. Estado actual: `apps/store` asume una única tienda activa (`getConfigDiseno().single()` y catálogo sin `tienda_id`); `apps/dashboard` ya resuelve la tienda por `usuario_id` con `.maybeSingle()`. InsForge ya provee `tienda_id`, `subdominio` y RLS por dueño. La caché usa `unstable_cache` con tags globales.

## Goals / Non-Goals

**Goals:**
- Servir N storefronts públicos aislados por ruta `/s/<subdominio>`.
- Mantener intacto el dashboard multi-usuario y añadir selección cuando el usuario tiene >1 tienda.
- Aislar catálogo, config, caché, carrito y metadatos por tienda.
- Dejar el modelo preparado para migrar a subdominios sin tocar queries ni datos.

**Non-Goals (diseño):**
- No se implementan subdominios, wildcard DNS ni SSL.
- No se cambia el diseño visual ni el checkout.
- No se añade alta/baja de tiendas ni facturación.

## Decisions

### 1. Resolución de tenant en middleware (rewrite)
El middleware de la store lee `/s/<subdominio>/...`, valida que exista una tienda activa con ese `subdominio` y reescribe a la ruta interna equivalente, inyectando el header `x-tienda-subdominio`. Las rutas internas (`/`, `/verProducto`, `/categoria`, etc.) no cambian. `/` redirige a `/s/<primera tienda activa>`.

**Alternativa considerada**: route group `app/[tienda]/...`. Descartada por duplicar páginas y complicar rutas existentes. El rewrite mantiene la estructura actual.

### 2. `resolverTienda()` en `lib/tenant.ts`
Lee el header `x-tienda-subdominio` y consulta `tiendas` por `subdominio` + `activa = true`. Devuelve `{ id, subdominio, config }` o `null`. Las páginas y layouts lo invocan una vez y propagan `tiendaId` a las queries y al contexto de cliente. Se evita consultar la tienda dentro de funciones cacheadas.

### 3. Queries filtradas por `tienda_id`
`getCategorias`, `getMarcas`, `getProductosDestacados`, `getCategoriaPorSlug`, `getMarcaPorNombre`, `getNavCategorias`, `getProductoPorSlug`, `getProductosPorCategoria` y `getConfigDiseno` reciben `tiendaId` como parámetro y añaden `.eq("tienda_id", tiendaId)` (o `.eq("subdominio", ...)` para config). `getConfigDiseno` deja de usar `.single()` sobre todas las activas y usa `.eq("subdominio", subdominio).maybeSingle()`.

### 4. Caché por tenant
`unstable_cache` incluye `tiendaId` en el array de keys y en los tags (`productos:${tiendaId}`). `/api/revalidate` acepta `tienda_id` y tags opcionales y solo invalida esa tienda. Las keys globales actuales se reemplazan por keys con tenant.

### 5. Contexto de tenant en cliente
Un `TenantProvider` (React context) expone `tiendaId` y `subdominio` a componentes client (links, carrito). Un helper `rutaTienda(path)` prefija `/s/<subdominio>`. `ProductCard`, `Navbar`, `Footer`, breadcrumbs y paginación lo usan para no perder el prefijo.

### 6. Carrito aislado
La clave de `localStorage` pasa de `"makced-cart"` a `"makced-cart:<tienda_id>"`. `checkout-datos` también por tienda. El `CartProvider` lee el `tienda_id` del contexto.

### 7. Dashboard: selector de tienda
`requireAuth()` deja de usar `.maybeSingle()` y devuelve `{ tiendas: Tienda[] }`. Si hay 1 tienda, se usa directamente. Si hay >1, se lee la selección desde una cookie `tienda-activa`; si no existe o no pertenece al usuario, se usa la primera. Se añade un selector en el layout (sidebar/header). Todas las actions ya filtran por `tienda.id`, por lo que solo cambia la resolución de la tienda activa.

### 8. Validación de propiedad
La selección de tienda en el dashboard valida contra RLS (`tiendas_owner_write`). Una tienda ajena retorna error de autorización. En la store pública, solo se sirven tiendas con `activa = true`.

### 9. Metadatos y sitemap
`generateMetadata` resuelve la tienda por la ruta y usa su producto/config. Sitemap por tienda (o un sitemap índice).

## Risks / Trade-offs

- [Middleware rewrite + `headers()` en server components] → verificar que `headers()` funciona dentro de server actions y `generateMetadata`. Mitigación: tests de integración por tenant.
- [Caché con tenant en key] → riesgo de explosión de keys si N tiendas. Mitigación: TTL existente (300s) y tags por tienda.
- [Enlaces internos sin prefijo] → si algún componente olvida `rutaTienda`, el usuario sale del tenant. Mitigación: tests E2E por tienda + helper tipado.
- [Carrito migración] → usuarios con carrito viejo (`makced-cart`) lo pierden. Mitigación: migrar una vez o ignorar (bajo impacto).
- [RLS anon lee todas las tiendas activas] → aceptable: el aislamiento se hace en la capa de aplicación (filtro por `tienda_id`). La RLS ya restringe escritura por dueño.
- [`.single()` en `getCategoriaPorSlug`/`getMarcaPorNombre`] → cambiar a `.maybeSingle()` y filtrar por `tienda_id`.

## Migration Plan

1. Migración DB: índice `tiendas(subdominio)` único parcial `WHERE activa = true`; unicidad `(tienda_id, slug)` en `productos`, `categorias`, `marcas`.
2. Implementar `lib/tenant.ts` + middleware rewrite.
3. Refactorizar queries de la store para aceptar `tiendaId`.
4. Añadir `TenantProvider` y `rutaTienda`.
5. Ajustar carrito y checkout.
6. Dashboard: selector de tienda + persistencia.
7. Metadatos/sitemap por tienda.
8. Tests E2E: 2 tiendas, aislamiento de catálogo, carrito, revalidación.
9. Rollback: revertir middleware a no-rewrite y queries a globales (los datos por `tienda_id` ya existen).

## Open Questions

- ¿El carrito debe ser por tienda o por usuario? (Asumimos por tienda, coherente con la vitrina.)
- ¿Los favoritos/valoraciones (si se implementan) se aíslan por tienda? (Fuera de alcance de esta fase.)
