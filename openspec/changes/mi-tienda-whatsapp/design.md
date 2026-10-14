# Design

## Context

`mi-tienda/page.tsx` (163 líneas) es un Server Component que renderiza 4 paneles en `.mt-grid` (2 columnas): Tu cuenta, Tu tienda, Contraseña, Accesos rápidos. Los datos vienen de `getTienda()` / `getUsuarioTienda()` (`actions/tienda.ts`).

`getTiendaPublica()` hace SELECT de columnas fijas de `tiendas`; el tipo `Tienda` (`types/database.ts:1-15`) no incluye `whatsapp_numero`.

El carrito del store (`apps/store/app/carrito/page.tsx`) es un Client Component que construye el enlace `wa.me/?text=` hardcoded sin número (línea 205).

Ver proposal.md — Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Eliminar el panel "Accesos rápidos" y sus estilos.
- Agregar columna `whatsapp_numero` a `tiendas` (nullable).
- Server Action `updateTiendaWhatsapp` con validación de formato (8–15 dígitos).
- Panel editable "Pedidos por WhatsApp" en el dashboard (input + Guardar + feedback).
- El carrito del store usa `wa.me/{numero}?text=` cuando hay número, con fallback a `wa.me/?text=`.

**Non-Goals:**
- No cambiar el diseño de los paneles existentes (Tu cuenta, Tu tienda, Contraseña).
- No agregar validación de que el número exista en WhatsApp (solo formato).
- No tocar el sidebar ni otras rutas del dashboard.
- No modificar el mensaje pre-cargado del carrito.

## Decisions

1. **Columna `whatsapp_numero TEXT NULL`**: migración simple, sin default, sin constraint de formato a nivel DB (la validación es en la Server Action). Alternativa descartada: guardar en el JSON `diseno` — menos consultable, acopla datos de negocio al JSON de UI.

2. **Server Action `updateTiendaWhatsapp(numero: string)`**: sigue el patrón de `requireTiendaDelUsuario()` (RLS auth.uid()) de `actions/diseno.ts`. Valida con regex `/^\d{8,15}$/` antes del UPDATE. Retorna `{ ok, error }`. Alternativa descartada: API route — las acciones server ya son el patrón del proyecto.

3. **Campo en `Tienda` interface**: se agrega `whatsapp_numero: string | null` al interface y al SELECT de `getTiendaPublica()`.

4. **Carrito (Client Component)**: el carrito no puede hacer fetch del server directamente. Opciones:
   - a) Fetch del cliente con SDK anónimo (el RLS permite SELECT público de tiendas) — simplest.
   - b) Envolver el carrito en un Server Component que pase el número como prop — más limpio pero toca más archivos.
   Se usa (a): fetch mínimo del cliente al montar, con fallback a `wa.me/?text=` mientras carga o si falla. El número se obtiene de la misma query pública que usa el store para productos.

5. **Validación**: solo dígitos, 8–15 caracteres (cubre internacionales con y sin +). El input en el dashboard usa `inputMode="numeric"` y filtra no-dígitos en onChange.

6. **DB (SQL)**: `ALTER TABLE tiendas ADD COLUMN whatsapp_numero TEXT;` — nullable, sin default.

## Risks / Trade-offs

- [El fetch del cliente en carrito agrega una llamada extra al cargar] → Mitigado: es una query ligera (una fila, una columna) y se cachea; el botón degrada a wa.me/?text= si falla.
- [El usuario podría guardar un número que no sea suyo de WhatsApp] → Aceptado: es validación de formato, no de propiedad; el dueño controla su tienda.
