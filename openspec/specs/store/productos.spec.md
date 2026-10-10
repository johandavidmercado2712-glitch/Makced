# Store - Productos

## Requirements

El sistema SHALL mostrar un catálogo de productos con las siguientes capacidades:

### R-1: Listado de productos
El store SHALL listar todos los productos disponibles de la tienda MAKCED.

### R-2: Búsqueda por nombre
El sistema SHALL permitir buscar productos por nombre usando un campo de búsqueda con debounce.

### R-3: Filtro por marca
El sistema SHALL filtrar productos por marca usando un select nativo.

### R-4: Filtro por categoría
El sistema SHALL filtrar productos por categoría usando un select nativo.

### R-5: Filtros combinados
El sistema SHALL soportar búsqueda + marca + categoría simultáneamente via URL search params.

### R-6: Precio con descuento
El sistema SHALL mostrar precio original y precio con descuento cuando exista.

### R-7: Tags de estado
El sistema SHALL mostrar tags "destacado" y "nuevo" según las propiedades del producto.

### R-8: Paginación
El sistema SHALL paginar resultados de productos (pendiente de implementar).

## Scenarios

### S-1: Listar productos
GIVEN que hay productos en la base de datos
WHEN el usuario visita /productos
THEN SHALL mostrar la lista completa de productos

### S-2: Buscar producto
GIVEN que hay productos "Nike Air Max" y "Adidas Ultraboost"
WHEN el usuario escribe "nike" en el campo de búsqueda
THEN SHALL mostrar solo "Nike Air Max"

### S-3: Filtrar por marca
WHEN el usuario selecciona "Nike" en el filtro de marca
THEN SHALL mostrar solo productos de la marca Nike

### S-4: Filtrar por categoría
WHEN el usuario selecciona "Running" en el filtro de categoría
THEN SHALL mostrar solo productos de la categoría Running

### S-5: Combinar filtros
WHEN el usuario busca "air" + filtro marca Nike + categoría Running
THEN SHALL mostrar solo productos que coincidan con los tres criterios
