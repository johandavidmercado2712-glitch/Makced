# Spec Delta

## Purpose

Permite que la tienda pública sirva catálogos y branding distintos por tenant (tienda) usando rutas path-based, sin mezclar datos entre tiendas y sin perder configuración cuando hay varias tiendas activas.

## ADDED Requirements

### Requirement: Resolución de tenant por ruta
El sistema SHALL resolver la tienda a servir a partir del primer segmento de la ruta `/s/<subdominio>/...`. El subdominio SHALL coincidir con la columna `tiendas.subdominio` y la tienda SHALL estar activa (`activa = true`). Si no existe o está inactiva, el sistema SHALL responder 404.

#### Scenario: Ruta de tienda válida
- **GIVEN** una tienda activa con `subdominio = "makced"`
- **WHEN** el usuario solicita `/s/makced`
- **THEN** el sistema renderiza el catálogo y el diseño de esa tienda.

#### Scenario: Subdominio inexistente
- **GIVEN** un subdominio `"no-existe"` sin fila en `tiendas`
- **WHEN** el usuario solicita `/s/no-existe`
- **THEN** el sistema responde 404.

#### Scenario: Tienda inactiva
- **GIVEN** una tienda con `activa = false`
- **WHEN** el usuario solicita su ruta `/s/<subdominio>`
- **THEN** el sistema responde 404.

### Requirement: Redirección de la raíz
El sistema SHALL redirigir `/` a la ruta `/s/<subdominio>` de la primera tienda activa (orden por `created_at`). Si no hay tiendas activas, SHALL mostrar la página de no-encontrado o una vista vacía sin caer en error.

#### Scenario: Visita a la raíz con tiendas activas
- **GIVEN** al menos una tienda activa
- **WHEN** el usuario solicita `/`
- **THEN** el sistema redirige a `/s/<subdominio>` de la primera tienda activa.

### Requirement: Catálogo aislado por tienda
Todas las consultas públicas de categorías, marcas, productos y destacados SHALL filtrar por `tienda_id = tienda_actual.id`. No SHALL mezclarse datos de más de una tienda en una misma respuesta.

#### Scenario: Productos por categoría de la tienda correcta
- **GIVEN** dos tiendas con categorías de igual slug "hombre"
- **WHEN** se solicita `/s/tienda-a/categoria/hombre`
- **THEN** solo se listan productos con `tienda_id = tienda-a.id`.

#### Scenario: Marcas de la tienda correcta
- **GIVEN** dos tiendas con marcas del mismo nombre
- **WHEN** se renderiza la página de marcas de `/s/tienda-a`
- **THEN** solo se muestran marcas con `tienda_id = tienda-a.id`.

### Requirement: Configuración y diseño por tienda
El sistema SHALL cargar `color_principal`, `logo_url` y `diseno` de la tienda resuelta por la ruta, sin depender de `.single()` sobre todas las tiendas activas. Si no hay tienda, SHALL usar los valores por defecto.

#### Scenario: Diseño de la tienda correcta
- **GIVEN** dos tiendas con colores distintos
- **WHEN** se renderiza `/s/tienda-a`
- **THEN** se aplican el color y logo de `tienda-a`.

### Requirement: Enlaces y navegación por tienda
Todos los enlaces internos (navbar, footer, cards de producto, categorías, breadcrumbs) SHALL conservar el prefijo `/s/<subdominio>` de la tienda actual.

#### Scenario: Navegación mantiene el tenant
- **GIVEN** el usuario está en `/s/tienda-a/categoria/hombre`
- **WHEN** hace clic en un producto
- **THEN** la URL resultante es `/s/tienda-a/verProducto?slug=...`.

### Requirement: Carrito aislado por tienda
El carrito SHALL persistirse en `localStorage` bajo una clave que incluya el `tienda_id` (ej. `makced-cart:<tienda_id>`). El carrito de una tienda no SHALL aparecer al cambiar de tienda.

#### Scenario: Carrito no se mezcla
- **GIVEN** items en el carrito de `/s/tienda-a`
- **WHEN** el usuario navega a `/s/tienda-b`
- **THEN** el carrito de `tienda-b` está vacío.

### Requirement: Caché y revalidación por tienda
Las funciones cacheadas (`unstable_cache`) SHALL incluir `tienda_id` en sus keys y tags. La invalidación por revalidate SHALL afectar únicamente a la tienda indicada.

#### Scenario: Revalidación no cruza tiendas
- **GIVEN** un cambio de diseño en `tienda-a`
- **WHEN** se llama `/api/revalidate` con `tienda_id = tienda-a.id`
- **THEN** solo se invalida la caché de `tienda-a`; `tienda-b` mantiene su caché.

### Requirement: Metadatos por tienda
`generateMetadata` SHALL usar el producto y el diseño de la tienda resuelta por la ruta. Sitemap y robots SHALL listar solo los productos de la tienda correspondiente (o un sitemap por tienda).

#### Scenario: Metadatos del producto correcto
- **GIVEN** un slug que existe en ambas tiendas
- **WHEN** se solicita `/s/tienda-a/verProducto?slug=x`
- **THEN** los metadatos (título, OG image) corresponden al producto de `tienda-a`.
