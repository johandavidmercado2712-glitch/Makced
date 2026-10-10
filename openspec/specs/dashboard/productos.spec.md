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
