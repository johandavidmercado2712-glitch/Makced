# Tasks

## 1. Reemplazar el skeleton de ProductCard

- [x] 1.1 En `apps/store/components/product/ProductCard.tsx`, reemplazar el JSX de la rama `if (loading)` (líneas 19-33) por el patrón simplificado: wrapper `${className} loading` con `flex flex-col gap-4 p-4`, seguido de un `skeleton h-32 w-full` (imagen) y tres `skeleton h-4` (`w-28`, `w-full`, `w-full`); verificar con typecheck que no hay errores de TS

## 2. Limpieza CSS huérfana

- [x] 2.1 En `apps/store/components/product/ProductCard.css`, eliminar la regla `.Productos-card.loading .product-content` (líneas 165-169) que queda huérfana tras el cambio; conservar `.Productos-card.loading { pointer-events: none }`; verificar con typecheck que no hay errores

## 3. Verificación final

- [x] 3.1 Correr `npm run typecheck` en la raíz del monorepo y verificar 3/3 paquetes exitosos sin errores
