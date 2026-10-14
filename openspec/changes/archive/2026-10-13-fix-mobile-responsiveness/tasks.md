# Tasks

## 1. Contraste de controles primarios (D3 — R-6)

- [x] 1.1 Agregar `--db-btn-primary-fg: #FFFFFF` en `:root` y `--db-btn-primary-fg: #121212` en `.dark` de `apps/dashboard/app/globals.css`; verificar con `npm run typecheck` sin errores y que la variable aparezca en el chunk compilado de globals
- [x] 1.2 Reemplazar cada `color: white|#fff` que tenga `background: var(--db-btn-primary)` por `var(--db-btn-primary-fg)` (inventario: `page.css:42`, `productos.css:46` y `:438`, `diseno.css:38/43` tabs, `modalProduct.css:222` y `:394`; confirmar que `diseno.css:262/317` NO se tocan por tener fondo propio); verificar con grep que no quede ningún `color: white` emparejado con fondo `--db-btn-primary` y revisando ambos temas con contraste ≥4.5:1

## 2. Base compartida del dashboard (D1/D2 — R-2)

- [x] 2.1 Crear `apps/dashboard/app/db-base.css` extrayendo las reglas compartidas duplicadas entre `page.css` y `productos.css` (panel, header con apilado ≤768, title, subtitle, btn-primary, btn-secondary, table panel, empty, tags, product cell) e importarlo vía `@import "./db-base.css";` en `apps/dashboard/app/globals.css` (restricción: SOLO CSS, sin tocar TSX); verificar `npm run typecheck` y que las reglas base aparezcan en el chunk compilado de globals
- [x] 2.2 Dejar `page.css` solo con estilos propios del Resumen (tarjetas, saludo, bestseller) y `productos.css` solo con filtros/tabla/paginación/product-cell, eliminando las reglas movidas; verificar por grep que ninguna clase movida quedó duplicada entre archivos y que las 5 rutas siguen respondiendo (307 con auth es esperado) sin errores de compilación
- [x] 2.3 Verificar equivalencia de comportamiento: a 768px `/` y `/productos` muestran el header apilado con el mismo tamaño de título (inspección autenticada en browser o del CSS compilado); registrar cualquier diferencia visual no prevista

## 3. Breakpoints canónicos dashboard (D7 — R-3, R-5)

- [x] 3.1 En `page.css`, cambiar el apilado de tarjetas del Resumen de ≤380 a ≤640 (1 columna con riel descontado); verificar que desaparezca el bloque 380 y que a 390px el contenido de tarjeta quede sin recorte
- [x] 3.2 Barrido de todo CSS del dashboard buscando `@media` fuera de {1024, 768, 640, 480} y plegar cada excepción en el canónico más cercano; verificar con grep que `apps/dashboard/**/*.css` solo contiene esos cuatro breakpoints

## 4. Riel y altura (D6 — R-1)

- [x] 4.1 En `sidebar.css` cambiar `height: 100vh` + `min-height: 100dvh` por el cascade `height: 100vh; height: 100dvh;`; verificar que el riel siga cubriendo la pantalla en 390px con overflow interno si hace falta

## 5. Store móvil (D4/D5 — R-1 a R-4 store)

- [x] 5.1 En `navbar.css`, añadir affordance a `.nav-session` a ≤768: degradados `::before`/::after de 24px en bordes (pointer-events none), `scroll-snap-type: x proximity` + snap en links, y targets ≥44px a ≤480; verificar visualmente en light y dark a 390px que el degradado se ve y los links enganchan
- [x] 5.2 Agregar en `apps/store/app/globals.css` el bloque `@media (prefers-reduced-motion: reduce)` que deja `.scroll-reveal` visible sin transición; verificar con emulación de "reducir movimiento" en DevTools que el contenido aparece de inmediato
- [x] 5.3 Plegar el breakpoint 360 de `apps/store/app/marcas/marcas.css` en 480 y verificar con grep que `apps/store/**/*.css` solo usa {1024, 768, 480}

## 6. Verificación final

- [ ] 6.1 Matriz visual autenticada: dashboard `/`, `/productos`, `/marcas`, `/diseno`, `/mi-tienda` en {390, 480, 768, 1024} y store home + navbar + `/marcas` en {390, 480, 768}; verificar sin scroll horizontal de página, header consistente entre rutas y botones legibles en dark (recordar: dashboard responde 307 sin sesión — autenticar primero)
- [x] 6.2 Correr `npm run typecheck` y `npm run lint` en la raíz; verificar 3/3 paquetes exitosos y 0 errores (warnings preexistentes aceptados)
