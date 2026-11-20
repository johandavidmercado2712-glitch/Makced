# Tasks

## 1. Base de datos

- [x] 1.1 Crear migración `migrations/<timestamp>_multitienda_indices.sql` con índice único parcial `tiendas(subdominio) WHERE activa = true`.
- [x] 1.2 Añadir unicidad `(tienda_id, slug)` en `productos`, `categorias` y `marcas` (o constraint parcial excluyendo soft-deleted).
- [ ] 1.3 Aplicar migración en InsForge y verificar con `SELECT` de prueba.
- [x] 1.4 Correr typecheck.

## 2. Tenant resolver (store)

- [x] 2.1 Crear `apps/store/lib/tenant.ts` con `resolverTienda()` (lee header `x-tienda-subdominio`, consulta por `subdominio` + `activa`, devuelve `{ id, subdominio, config } | null`).
- [x] 2.2 Crear middleware `apps/store/proxy.ts` para reescribir `/s/<sub>/...` a la ruta interna inyectando el header; redirigir `/` a la primera tienda activa; 404 si no existe/inactiva.
- [x] 2.3 Excluir de middleware `/api`, `_next`, estáticos, `sitemap.xml`, `robots.txt`.
- [x] 2.4 Correr typecheck.

## 3. Queries de la store por tienda

- [x] 3.1 Refactorizar `getConfigDiseno` para recibir `tiendaId`/`subdominio` y usar `.eq("subdominio", ...).maybeSingle()`.
- [x] 3.2 Añadir `tiendaId` a `getCategorias`, `getMarcas`, `getNavCategorias`, `getCategoriaPorSlug`, `getMarcaPorNombre`.
- [x] 3.3 Añadir `tiendaId` a `getProductosDestacados`, `getProductosPorCategoria`, `getProductoPorSlug` y demás queries de `products.ts`.
- [x] 3.4 Cambiar `.single()` a `.maybeSingle()` donde aplique y manejar ausencia.
- [x] 3.5 Actualizar páginas (`page.tsx`, `categoriaProductos`, `marcasProductos`, `verProducto`, `novedades`) para resolver tenant y pasar `tiendaId`.
- [x] 3.6 Correr typecheck y tests unitarios de store.

## 4. Navegación y carrito

- [x] 4.1 Crear `TenantProvider` y helper `rutaTienda(path)` en `apps/store`.
- [ ] 4.2 Actualizar `Navbar`, `Footer`, `ProductCard`, breadcrumbs y paginación para usar `rutaTienda`.
- [ ] 4.3 Cambiar clave de `localStorage` del carrito a `makced-cart:<tienda_id>` (y `checkout-datos` por tienda).
- [ ] 4.4 Actualizar `CartProvider` para leer `tienda_id` del contexto.
- [ ] 4.5 Correr typecheck y tests de cart.

## 5. Metadatos y sitemap

- [x] 5.1 Ajustar `generateMetadata` en `verProducto` para resolver tenant por ruta.
- [ ] 5.2 Crear sitemap por tienda (o índice) filtrado por `tienda_id`.
- [x] 5.3 Correr typecheck.

## 6. Revalidación por tienda

- [x] 6.1 Modificar `/api/revalidate` para aceptar `tienda_id` y tags opcionales.
- [x] 6.2 Actualizar `invalidarCacheTienda` y `actions/diseno.ts`, `actions/marcas.ts`, `mostrar-precios/route.ts` para pasar `tienda_id`.
- [ ] 6.3 Ajustar keys/tags de `unstable_cache` para incluir `tienda_id`.
- [x] 6.4 Correr typecheck.

## 7. Dashboard: selección de tienda

- [x] 7.1 Cambiar `requireAuth()` para devolver `{ tiendas: Tienda[] }` en lugar de `.maybeSingle()`.
- [x] 7.2 Implementar resolución de tienda activa desde cookie `tienda-activa` (validada contra la lista del usuario), fallback a la primera.
- [x] 7.3 Añadir selector de tienda en el layout cuando `tiendas.length > 1`.
- [x] 7.4 Persistir selección en cookie y revalidar la vista.
- [x] 7.5 Verificar que todas las actions usan la tienda seleccionada (auditar `requireAuth` callers).
- [x] 7.6 Correr typecheck y tests del dashboard.

## 8. Validación E2E

- [ ] 8.1 Crear 2 tiendas de prueba en InsForge con subdominios `makced` y `tienda2`.
- [ ] 8.2 Añadir test E2E: aislamiento de catálogo entre `/s/makced` y `/s/tienda2`.
- [ ] 8.3 Añadir test E2E: carrito aislado por tienda.
- [ ] 8.4 Añadir test E2E: edición independiente en dashboard (2 usuarios o 2 tiendas del mismo usuario).
- [ ] 8.5 Ejecutar suite completa y verificar 0 regresiones.

## 9. Cierre

- [x] 9.1 Correr `npm run typecheck` en todo el monorepo.
- [x] 9.2 Correr `npm run build` en los 3 apps.
- [ ] 9.3 Actualizar `README.md` con la sección de multi-tienda path-based.
- [x] 9.4 Actualizar `SECURITY-REPORT.md` si aplica.
