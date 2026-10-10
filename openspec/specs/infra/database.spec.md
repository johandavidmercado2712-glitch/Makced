# Infraestructura - Base de Datos

## Requirements

El sistema SHALL usar InsForge como backend de base de datos.

### R-1: Conexión a InsForge
El sistema SHALL conectar a InsForge via @insforge/sdk en lib/insforge.ts.

### R-2: Server Actions
Todas las consultas a la DB SHALL usar Server Actions con "use server" directive.

### R-3: Datos simples
Los Server Actions SHALL retornar solo objetos simples (no funciones ni clases).

### R-4: Joins como arrays
Los joins de InsForge retornan arrays: `marca: [{id, nombre}]`.
El código SHALL acceder como `producto.marca?.[0]?.nombre`.

### R-5: Promise.all
Las consultas paralelas SHALL usar Promise.all para optimizar carga.

### R-6: Revalidation
Los cambios en DB SHALL usar revalidation para actualizar UI.

## Scenarios

### S-1: Conexión exitosa
GIVEN que las credenciales de InsForge son correctas
WHEN el servidor ejecuta una Server Action
THEN SHALL retornar datos de la DB

### S-2: Join de marca
GIVEN que un producto tiene marca_id
WHEN se consulta el producto con select de marcas
THEN SHALL retornar marca como array [{id, nombre}]

### S-3: Consulta paralela
GIVEN que se necesitan productos, marcas y categorías
WHEN se ejecuta Promise.all([getProductos(), getMarcas(), getCategorias()])
THEN SHALL ejecutar las 3 consultas en paralelo
