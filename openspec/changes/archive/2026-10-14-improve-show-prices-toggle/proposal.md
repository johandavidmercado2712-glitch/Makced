# Proposal

## Why

El botón "Mostrar precios en tienda" en la cabecera del dashboard (`/productos`) controla si la tienda pública muestra o oculta precios (productos, carrito, pedidos por WhatsApp). La verificación en solo lectura confirma que el flujo de datos funciona (DB `diseno.mostrar_precios = false` actual, defaults consistentes `?? true` en dashboard/store/`DEFAULT_DISENO`, columna `updated_at` presente, auth RLS correcta), pero el control es un checkbox nativo con `style={{...}}` inline que ignora los design tokens `--db-*`, no tiene affordance de switch (on/off), no usa `aria-*`, y el contenedor del header usa estilos inline en vez de la clase `db-header-actions` (pierde el responsive 768/480 que sí aplican los demás headers). El usuario pide verificar el correcto funcionamiento y mejorar el diseño de esa opción.

## What Changes

- **Diseño del control**: reemplazar el checkbox nativo por un switch tipo pill (on/off) con design tokens `--db-*`, estado visual claro, feedback "Guardado"/error con estilo de tokens, `role="switch"` + `aria-checked` + `aria-busy`, y cleanup del timeout al desmontar.
- **Header del dashboard**: reemplazar el `style={{...}}` inline del contenedor de acciones en `productos/page.tsx` por la clase `db-header-actions` existente para recuperar el responsive (768: ancho completo; 480: columna).
- **Verificación funcional**: confirmar en implementación que el toggle persiste en `tiendas.diseno.mostrar_precios` (read-modify-write preserva claves), que el store lo refleja (consistencia eventual dentro de la ventana ISR 15–300s, aceptada), y que `CartProvider`/`ProductGrid` reaccionan.
- **Sin cambios de comportamiento**: la persistencia, la API y los defaults NO cambian; es una mejora de diseño y verificación.

## Capabilities

### Modified Capabilities

- `dashboard/productos`: se agrega la requirement del control switch accesible y el uso de `db-header-actions` en la cabecera (delta sobre el spec existente).

### New Capabilities

_(ninguna)_

## Impact

- **Archivos**: `apps/dashboard/components/ToggleShowPrices.tsx` (reescritura del UI), `apps/dashboard/app/productos/page.tsx` (clase `db-header-actions`), `apps/dashboard/app/mi-tienda/...` no aplica; posiblemente `productos.css` o una CSS del componente para el switch.
- **Afecta**: dashboard (UI). Store: solo verificación, sin cambios de código.
- **DB/API**: sin cambios.
- **Riesgo**: bajo — mismo contrato de datos, solo presentación; el comportamiento observable del toggle (persistencia, defaults) se mantiene.
