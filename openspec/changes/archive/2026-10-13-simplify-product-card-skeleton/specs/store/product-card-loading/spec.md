# Spec Delta

## Purpose

Define el comportamiento del esqueleto de carga mostrado mientras se resuelve el contenido de una card de producto en el store, garantizando un feedback visual simple y consistente en home, categoriaProductos y marcasProductos.

## ADDED Requirements

### Requirement: Esqueleto de carga simplificado para ProductCard
Cuando una card de producto está en estado de carga, el sistema SHALL mostrar un esqueleto compuesto por un bloque de imagen y tres líneas de texto, sin reproducir la estructura interna de la card real.

#### Scenario: Skeleton visible durante la carga
- **WHEN** el componente `ProductCard` recibe la prop `loading` en `true` (apps/store/components/product/ProductCard.tsx:19)
- **THEN** se renderiza un contenedor `flex flex-col gap-4` que ocupa el ancho de celda del grid `Productos-cards`
- **AND** el primer elemento es un `skeleton` de imagen con `h-32 w-full`
- **AND** le siguen tres `skeleton` de línea con `h-4` y anchos variados (por ejemplo `w-28`, `w-full`, `w-full`)

#### Scenario: Skeleton se adapta al grid
- **WHEN** el esqueleto de carga se muestra dentro de un `Productos-cards` (grid responsivo del store)
- **THEN** el ancho del skeleton sigue el ancho de la celda del grid, sin forzar un ancho fijo tipo `w-52`

#### Scenario: Sin interacción durante la carga
- **WHEN** el esqueleto de carga está visible
- **THEN** el contenedor no debe ser clickeable ni enfocable (pointer-events deshabilitados)
