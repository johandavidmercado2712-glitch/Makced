# Proposal

## Why

La responsividad móvil se construyó por partes y hoy es inconsistente: el dashboard tiene **dos hojas "base" que compiten por ruta** (`page.css` apila `db-header` a ≤640, `productos.css` — que cargan las otras 4 rutas — a ≤768; `db-btn-primary` está duplicado en ambas), los breakpoints de tarjetas ignoran que el contenido ya descuenta el riel de 68px (iPhone de 390px ve tarjetas de ~144px), conviven **8 breakpoints** (360/380/480/520/640/768/900/1024), la store no da affordance a la tira de links del navbar en móvil, y los botones primarios en dark mode quedaron con texto blanco sobre verde `#4CE1AC` (contraste ≈1.9:1, ilegible).

## What Changes

- **Dashboard — base compartida única:** consolidar las clases `db-*` duplicadas (header, title, btn-primary, panel…) en una sola hoja importada por todas las rutas; elimina diferencias de comportamiento entre Resumen y el resto.
- **Dashboard — breakpoints normalizados:** set `{1024, 768, 480}` (+`640` donde aporta); tarjetas del Resumen a 1 columna a ≤640 (no ≤380); eliminar 380.
- **Dashboard — contraste dark:** nueva variable `--db-btn-primary-fg` (blanco en light, oscuro en dark) que reemplaza los `color: white/#fff` hardcodeados en botones primarios, tabs activas y elementos con fondo `--db-btn-primary`.
- **Dashboard — riel:** `height: 100dvh` en el sidebar (hoy `100vh` + `min-height:100dvh` no se corrigen entre sí).
- **Store — navbar móvil:** la tira horizontal de links de sesión (≤768) gana affordance visible (degradados en bordes + scroll-snap) y targets táctiles ≥44px en ≤480.
- **Store — accesibilidad:** `prefers-reduced-motion` desactiva `scroll-reveal` (solo LoginForm lo respeta hoy).
- **Store — normalización:** plegar el breakpoint 360 de `marcas.css` en 480.

Sin cambios de base de datos, server actions ni APIs; el `/diseno` no cambia de comportamiento.

## Capabilities

### New Capabilities

- `dashboard/responsive`: layout del dashboard en móvil/tablet — riel de iconos, apilado de headers, grillas de tarjetas, scroll de tablas, breakpoints canónicos y legibilidad de controles primarios en ambos temas.
- `store/responsive`: store en móvil — navegación con targets táctiles, grids/carruseles y animaciones que respetan preferencias del sistema.

### Modified Capabilities

- Ninguna. `dashboard/diseno` no cambia a nivel de requisitos.

## Impact

- **Apps:** `apps/dashboard` (globals, page, productos, diseno, mi-tienda, sidebar CSS) y `apps/store` (navbar, globals, marcas CSS). **No toca** `apps/login`.
- **Sin cambios:** DB, InsForge, server actions, rutas.
- **Verificación:** desde `08e0809` el dashboard responde 307 → login sin sesión; las verificaciones deben contemplarlo.
- **Riesgo:** consolidar la base puede alterar estilos sutiles por ruta → revisión visual en 390/480/768/1024.

## Non-goals

- Migrar el dashboard a utilities de Tailwind o retirar sus imports.
- Hamburguesa/drawer en la store (se opta por affordance sobre la tira existente).
- Cambios en `apps/login` (conserva breakpoints 900/520).
- Cambios de comportamiento o copy del editor `/diseno`.
- Modificar la paleta del design system.
