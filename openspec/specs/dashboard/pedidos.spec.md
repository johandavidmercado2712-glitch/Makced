# Dashboard - Pedidos

## Requirements

El dashboard SHALL gestionar los pedidos de la tienda MAKCED.

### R-1: Lista de pedidos recientes
El dashboard SHALL mostrar los últimos 5 pedidos ordenados por fecha de creación.

### R-2: Estados de pedido
El sistema SHALL soportar los siguientes estados: pendiente, pagado, enviado, entregado, cancelado.

### R-3: Conteo por estado
El dashboard SHALL contar pedidos por estado para mostrar estadísticas.

### R-4: Nombre del cliente
El sistema SHALL mostrar el nombre del cliente en cada pedido.

### R-5: Total del pedido
El sistema SHALL mostrar el total formateado en pesos colombianos.

## Scenarios

### S-1: Ver pedidos recientes
GIVEN que hay pedidos en la DB
WHEN el admin visita la página de pedidos
THEN SHALL mostrar los últimos 5 pedidos con fecha, cliente, total y estado

### S-2: Sin pedidos
GIVEN que no hay pedidos
WHEN el admin visita la página de pedidos
THEN SHALL mostrar estado vacío "No hay pedidos recientes"

### S-3: Conteo por estado
WHEN el admin carga el dashboard
THEN SHALL mostrar conteo de pedidos por cada estado
