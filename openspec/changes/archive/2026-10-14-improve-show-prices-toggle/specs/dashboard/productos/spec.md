# Spec Delta

## Purpose

Define el comportamiento del control "Mostrar precios en tienda" en la cabecera del dashboard de productos: switch accesible con design tokens, persistencia verificada del flag `diseno.mostrar_precios`, y uso de la clase `db-header-actions` en el contenedor de acciones.

## ADDED Requirements

### Requirement: Control switch accesible con design tokens
El control "Mostrar precios en tienda" SHALL renderizarse como un switch tipo pill (on/off) que use los design tokens `--db-*` del dashboard, sin estilos inline. SHALL exponer `role="switch"` y `aria-checked` reflejando el estado, y `aria-busy` durante el guardado. El timeout que limpia el mensaje de feedback SHALL limpiarse al desmontar el componente.

#### Scenario: Estado on/off visible
- **GIVEN** el dashboard autenticado en `/productos` con `diseno.mostrar_precios = true`
- **WHEN** se carga la cabecera
- **THEN** el switch se muestra en posición "on" con estado visual claro y `aria-checked="true"`

#### Scenario: Toggle y feedback de guardado
- **GIVEN** el switch en cualquier estado
- **WHEN** el usuario hace clic
- **THEN** se envía el cambio a `POST /api/settings/mostrar-precios` y, en éxito, se muestra el mensaje "Guardado" con estilo de tokens hasta auto-limpiarse (~2s)

#### Scenario: Error de sesión
- **GIVEN** la sesión expirada
- **WHEN** el usuario hace clic en el switch
- **THEN** se muestra "Sesión expirada. Inicia sesión de nuevo." y el estado del switch no se altera

### Requirement: Persistencia del flag de precios
El sistema SHALL persistir `mostrar_precios` en el JSONB `tiendas.diseno` preservando las demás claves (read-modify-write), y el store público SHALL reflejar el cambio por consistencia eventual dentro de la ventana ISR de sus rutas (15–300s). El default cuando la clave ausente SHALL ser `true` (ya establecido en `DEFAULT_DISENO` de `packages/db/src/diseno.ts`).

#### Scenario: Persistencia verificada
- **GIVEN** el dueño de la tienda autenticado
- **WHEN** alterna el switch a "off"
- **THEN** `tiendas.diseno.mostrar_precios` queda en `false` y las demás claves de `diseno` se conservan

#### Scenario: Reflejo en el store (consistencia eventual)
- **GIVEN** el flag en `false` persistido
- **WHEN** se visita una ruta del store con `revalidate` vigente (ej. home, 60s)
- **THEN** los precios desaparecen de las tarjetas de producto y del carrito tras expirar la ventana de revalidate, sin necesidad de redeploy

### Requirement: Cabecera con clase db-header-actions
El contenedor de acciones de la cabecera de `/productos` (`apps/dashboard/app/productos/page.tsx`, línea del header) SHALL usar la clase `db-header-actions` existente en `db-base.css` en lugar de estilos inline, para aplicar el responsive heredado (≤768px ancho completo; ≤480px columna).

#### Scenario: Responsive del header
- **GIVEN** el dashboard en viewport ≤480px
- **WHEN** se carga `/productos`
- **THEN** las acciones del header (agregar producto + switch) se apilan verticalmente a ancho completo, igual que en otras páginas del dashboard
