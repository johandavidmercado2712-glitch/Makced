# Dashboard - Productos

## Requirements

El dashboard SHALL gestionar el catálogo de productos de la tienda MAKCED.

### R-1: Listado de productos
El dashboard SHALL listar todos los productos con búsqueda y filtros.

### R-2: Búsqueda por nombre
El sistema SHALL filtrar productos en tiempo real por nombre via URL search params.

### R-3: Filtro por marca
El sistema SHALL filtrar productos por marca usando FilterSelect.

### R-4: Filtro por categoría
El sistema SHALL filtrar productos por categoría usando FilterSelect.

### R-5: Contador de resultados
El sistema SHALL mostrar "Mostrando X–Y de Z productos" con los filtros aplicados y Z igual al total filtrado.

### R-6: Tabla de productos
El sistema SHALL mostrar tabla con columnas: Producto, Categoría, Precio, Estado, Acciones.

### R-7: Tags de estado
El sistema SHALL mostrar tags "destacado" y "nuevo" en la columna Estado.

### R-8: Acciones por producto
El sistema SHALL mostrar botones de editar y eliminar por cada producto.

### R-9: Paginación
El sistema SHALL paginar la tabla con 10 productos por página usando el parámetro de URL `page`, conservando los filtros activos. Cambiar búsqueda o filtro SHALL reiniciar la página a 1. Una página fuera de rango SHALL ajustarse a la última página válida. El componente de paginación SHALL ocultarse cuando solo existe una página.

### R-10: Control switch accesible con design tokens
El control "Mostrar precios en tienda" SHALL renderizarse como un switch tipo pill (on/off) que use los design tokens `--db-*` del dashboard, sin estilos inline (`apps/dashboard/components/ToggleShowPrices.tsx`). SHALL exponer `role="switch"` y `aria-checked` reflejando el estado, y `aria-busy` durante el guardado. El timeout que limpia el mensaje de feedback SHALL limpiarse al desmontar el componente.

### R-11: Persistencia del flag de precios
El sistema SHALL persistir `mostrar_precios` en el JSONB `tiendas.diseno` preservando las demás claves (read-modify-write), y el store público SHALL reflejar el cambio por consistencia eventual dentro de la ventana ISR de sus rutas (15–300s). El default cuando la clave ausente SHALL ser `true` (`DEFAULT_DISENO` en `packages/db/src/diseno.ts:111`).

### R-12: Cabecera con clase db-header-actions
El contenedor de acciones de la cabecera de `/productos` (`apps/dashboard/app/productos/page.tsx`) SHALL usar la clase `db-header-actions` existente en `db-base.css` en lugar de estilos inline, para aplicar el responsive heredado (≤768px ancho completo; ≤480px columna).

## Scenarios

### S-1: Listar productos
GIVEN que hay productos en la DB
WHEN el admin visita /productos
THEN SHALL mostrar la tabla completa de productos

### S-2: Buscar producto
WHEN el admin escribe "nike" en el filtro de búsqueda
THEN SHALL filtrar productos por nombre conteniendo "nike"

### S-3: Filtrar por marca
WHEN el admin selecciona una marca en el filtro
THEN SHALL mostrar solo productos de esa marca

### S-4: Sin resultados
WHEN no hay productos que coincidan con los filtros
THEN SHALL mostrar "No se encontraron productos"

### S-5: Paginar
GIVEN que hay 16 productos sin filtros
WHEN el admin visita /productos?page=2
THEN SHALL mostrar solo la segunda página y el contador "11–16 de 16 productos"

### S-6: Cambiar filtro reinicia la página
GIVEN que el admin está en la página 2
WHEN cambia la búsqueda o un filtro
THEN SHALL navegar a la página 1 (el parámetro `page` se elimina)

### S-7: Estado on/off visible del switch
GIVEN el dashboard autenticado en `/productos` con `diseno.mostrar_precios = true`
WHEN se carga la cabecera
THEN el switch se muestra en posición "on" con estado visual claro y `aria-checked="true"`

### S-8: Toggle y feedback de guardado
GIVEN el switch en cualquier estado
WHEN el usuario hace clic
THEN se envía el cambio a `POST /api/settings/mostrar-precios` y, en éxito, se muestra el mensaje "Guardado" con estilo de tokens hasta auto-limpiarse (~2s)

### S-9: Error de sesión en el switch
GIVEN la sesión expirada
WHEN el usuario hace clic en el switch
THEN se muestra "Sesión expirada. Inicia sesión de nuevo." y el estado del switch no se altera

### S-10: Persistencia verificada del flag
GIVEN el dueño de la tienda autenticado
WHEN alterna el switch a "off"
THEN `tiendas.diseno.mostrar_precios` queda en `false` y las demás claves de `diseno` se conservan

### S-11: Reflejo en el store (consistencia eventual)
GIVEN el flag en `false` persistido
WHEN se visita una ruta del store con `revalidate` vigente (ej. home, 60s)
THEN los precios desaparecen de las tarjetas de producto y del carrito tras expirar la ventana de revalidate, sin necesidad de redeploy

### S-12: Responsive del header con db-header-actions
GIVEN el dashboard en viewport ≤480px
WHEN se carga `/productos`
THEN las acciones del header (agregar producto + switch) se apilan verticalmente a ancho completo, igual que en otras páginas del dashboard
