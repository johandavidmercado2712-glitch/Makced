# Dashboard - Marcas y categorías

## Requirements

El dashboard SHALL administrar las marcas y categorías de la tienda MAKCED desde la página `/marcas` (dos paneles: Marcas y Categorías).

### R-1: Listado
El sistema SHALL listar todas las marcas y todas las categorías (activas e inactivas) con su estado.

### R-2: Crear y editar
El sistema SHALL crear y editar marcas (nombre, imagen tipo logo, activa) y categorías (nombre, imagen, activa) mediante modales. El nombre SHALL ser obligatorio. Al crear una categoría se SHALL generar un `slug` único; al editar, el `slug` se mantiene.

### R-3: Imagen en dos modos
Cada modal SHALL ofrecer "Subir archivo" o "Pegar URL" (mismo comportamiento que productos): validación JPG/PNG/WebP y máximo 5 MB, subida al guardar, y "Quitar imagen" con opción de deshacer.

### R-4: Almacenamiento de la imagen
La imagen subida SHALL guardarse en el bucket de storage con la clave en `marcas.logo_key` / `categorias.imagen_key` y la URL pública en `logo_url` / `imagen_url`. Al reemplazar o quitar una imagen, el archivo anterior del bucket SHALL borrarse.

### R-5: Desactivar
El sistema SHALL permitir marcar marca/categoría como inactiva; estas NO se mostrarán en los selectores del modal de productos ni en la tienda.

### R-6: Eliminar con bloqueo
El sistema SHALL eliminar una marca/categoría solo si ningún producto la usa; en caso contrario SHALL mostrar un mensaje con la cantidad de productos que la usan y NO modificar nada. Al eliminar, la fila y su archivo del bucket SHALL borrarse.

### R-7: Refresco de datos
Crear, editar o eliminar SHALL refrescar `/marcas` y `/productos` (los filtros del catálogo).

## Scenarios

### S-1: Crear marca con archivo
WHEN el admin crea una marca eligiendo un archivo
THEN la imagen se sube al bucket, la marca queda en la DB con `logo_url` + `logo_key` y aparece en la lista

### S-2: Eliminar marca en uso
GIVEN que la marca "Nike" tiene productos
WHEN el admin intenta eliminarla
THEN SHALL mostrarse un mensaje de bloqueo y la marca permanecerá intacta

### S-3: Reemplazar imagen de categoría
WHEN el admin edita una categoría cambiando la imagen
THEN la nueva imagen se guarda y el archivo anterior del bucket SHALL borrarse

### S-4: Categoría con slug único
GIVEN que existe la categoría "Zapatillas" (slug `zapatillas`)
WHEN se crea otra categoría llamada "Zapatillas"
THEN su slug SHALL ser `zapatillas-2`
