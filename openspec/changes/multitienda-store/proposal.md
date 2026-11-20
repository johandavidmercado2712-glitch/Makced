# Proposal

## Why

La store pública asume una única tienda activa: `getConfigDiseno()` usa `.single()` y el catálogo no filtra por `tienda_id`. Con 2+ tiendas en InsForge el catálogo se mezcla, los slugs colisionan y la configuración cae a defaults. El dashboard ya es multi-usuario pero no permite editar varias tiendas de forma independiente. Necesitamos validar el modelo multi-tienda con rutas path-based antes de invertir en dominio/subdominios.

## What Changes

- **Store**: resolución de tienda por ruta `/s/[subdominio]/...` (path-based) mediante middleware; `/` redirige a la primera tienda activa.
- **Store**: todas las lecturas (config, productos, marcas, categorías, nav, búsqueda) se filtran por `tienda_id`.
- **Store**: enlaces internos, breadcrumbs y navegación conservan el prefijo `/s/<subdominio>`.
- **Store**: carrito y checkout aislados por tienda (clave de storage por `tienda_id`).
- **Store**: 404 para subdominio inexistente o inactivo; metadatos y sitemap por tienda.
- **Dashboard**: resuelve la lista de tiendas del usuario; si tiene más de una, selector persistido; cada acción se ejecuta sobre la tienda seleccionada.
- Caché y revalidación por tienda (keys/tags con `tienda_id`).
- **BREAKING**: las URLs públicas pasan a `/s/<subdominio>/...`; los enlaces antiguos sin prefijo redirigen a la tienda por defecto en lugar de resolver el catálogo.
- Preparado para migrar a subdominios (`<sub>.dominio.com`) sin cambiar el modelo de datos.

## Capabilities

### New Capabilities
- `store/multitienda`: resolución de tenant por ruta, catálogo/config/caché aislados, rutas y carrito por tienda.
- `dashboard/multitienda`: selección y edición independiente de la tienda del usuario.

### Modified Capabilities
- Ninguna. Las specs existentes (`store/responsive`, `store/price-filter`, `store/product-card-loading`, `dashboard/diseno`, `dashboard/responsive`) describen UI y no cambian sus requisitos.

## Non-goals

- No se implementan subdominios ni dominios personalizados en esta fase (solo path-based).
- No se crea UI de alta/baja de tiendas ni facturación/SaaS.
- No se cambian las policies RLS existentes salvo índices/constraints necesarios.
- No se migra el checkout/pagos por tienda.
- No se toca el diseño visual de la store.

## Impact

- **Store** (`apps/store`): middleware/proxy, rutas, server actions, componentes (links/nav/cart), metadata, sitemap y `/api/revalidate`.
- **Dashboard** (`apps/dashboard`): `actions/tienda.ts`, layout/sidebar (selector) y server actions que dependen de `requireAuth()`.
- **DB** (`packages/db`): helpers de tenant/caché; migraciones para índices y unicidad `(tienda_id, slug)`.
- No hay cambios de esquema obligatorios: `tienda_id` y `subdominio` ya existen.
