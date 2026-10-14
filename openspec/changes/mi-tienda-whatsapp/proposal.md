# Proposal

## Why

La página "Mi Tienda" del dashboard muestra un panel "Accesos rápidos" con links que ya existen en el sidebar (diseño, productos, ver tienda), ocupando espacio sin aportar valor. Además, el botón "Pedir por WhatsApp" del carrito del store abre WhatsApp sin número específico — el vendedor no recibe los pedidos directamente. Se necesita un lugar donde el dueño de la tienda configure su número de WhatsApp de pedidos y que el store lo use.

## What Changes

- **Dashboard — quitar Accesos rápidos**: eliminar el panel "Accesos rápidos" (links a /diseno, /productos, ver tienda) de `mi-tienda/page.tsx` y sus estilos `.mt-accesos`/`.mt-acceso` de `mi-tienda.css`.
- **Dashboard — nuevo panel WhatsApp**: agregar un panel editable "Pedidos por WhatsApp" en el mismo grid 2-columnas, con un campo para el número (formato internacional, ej. `573001234567`) y botón Guardar. Reemplaza el panel de accesos rápidos en la posición del grid.
- **DB — nueva columna**: migración SQL para agregar `whatsapp_numero TEXT` a la tabla `tiendas` (nullable, sin default).
- **Server Action**: nueva acción `updateTiendaWhatsapp(numero)` que valida el formato (solo dígitos, 8–15 caracteres) y persiste con `requireTiendaDelUsuario()` + RLS.
- **Store — usar el número**: el botón "Pedir por WhatsApp" del carrito (`apps/store/app/carrito/page.tsx`) cambia de `wa.me/?text=` a `wa.me/{numero}?text=` cuando la tienda tiene número configurado; si no hay número, mantiene el comportamiento actual (wa.me/?text=).

## Capabilities

### New Capabilities

- `dashboard/mi-tienda`: Comportamiento de la página "Mi Tienda" del dashboard — paneles de información, edición de WhatsApp, y ausencia del panel de accesos rápidos.
- `store/whatsapp-order`: Uso del número de WhatsApp de la tienda en el botón de pedido del carrito del store.

### Modified Capabilities

_(ninguna)_

## Impact

- **Archivos**: `apps/dashboard/app/mi-tienda/page.tsx`, `apps/dashboard/app/mi-tienda/mi-tienda.css`, `apps/dashboard/actions/tienda.ts`, `apps/store/app/carrito/page.tsx`, `apps/dashboard/types/database.ts` (campo en interface Tienda).
- **DB**: migración SQL — nueva columna `whatsapp_numero` en `tiendas`.
- **Server Actions**: nueva `updateTiendaWhatsapp`; se modifica `getTiendaPublica` para incluir el nuevo campo en el SELECT.
- **Afecta**: dashboard + store.
- **No afecta**: login, diseño, productos, pedidos existentes.
- **Riesgo**: bajo — columna nullable, comportamiento del store degrada gracefully si no hay número.
