# Spec Delta

## Purpose

Define el comportamiento del filtro de precio máximo en las páginas de productos del store, donde el usuario escribe un valor numérico directo que se sincroniza con la URL para filtrar productos.

## ADDED Requirements

### Requirement: Filtro de precio máximo por campo numérico
El filtro de precio SHALL mostrar un campo de entrada numérica donde el usuario escribe el precio máximo, en lugar de un slider.

#### Scenario: Campo numérico visible
- **WHEN** el componente `FiltroPrecio` se renderiza con una prop `maxPrice` (apps/store/components/product/FiltroPrecio.tsx)
- **THEN** se muestra un campo de entrada numérica (`input type="number"` o equivalente) con `min=0` y `max=maxPrice`
- **AND** el valor inicial del campo refleja el `maxPrice` actual de la URL (searchParam `maxPrice`) o el `maxPrice` completo si no hay searchParam

#### Scenario: Escribir un precio y confirmar
- **WHEN** el usuario escribe un número válido en el campo y presiona Enter o el campo pierde el foco (blur)
- **THEN** el sistema actualiza el searchParam `maxPrice` de la URL con el valor escrito (via `router.replace` en `startTransition`, sin scroll)
- **AND** si el valor escrito es mayor o igual al `maxPrice` completo, el searchParam `maxPrice` se elimina de la URL

#### Scenario: Valor inválido o vacío
- **WHEN** el usuario deja el campo vacío o escribe un valor no numérico / negativo
- **THEN** el filtro NO actualiza la URL (mantiene el último `maxPrice` válido)
- **AND** el campo muestra indicación de error o vuelve al último valor válido según el estado del input

### Requirement: Rediseño visual del filtro
El contenedor del filtro SHALL seguir el lenguaje de diseño del store: fondo `--bg-card`, borde `--border-color`, radio `--radius-md`, tipografía consistente con el resto de filtros.

#### Scenario: Apariencia del contenedor
- **WHEN** el filtro se renderiza en desktop (>= 769px)
- **THEN** el contenedor usa fondo `var(--bg-card)`, borde `1px solid var(--border-color)`, border-radius `var(--radius-md)`
- **AND** el input tiene borde propio, foco visible con `--primary-mint`

#### Scenario: Responsive móvil
- **WHEN** el filtro se renderiza en viewport <= 768px
- **THEN** el contenedor ocupa el ancho completo (`width: 100%`), sin márgenes horizontales extra
