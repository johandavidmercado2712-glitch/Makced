# Spec Delta

## Purpose

Permite que un usuario gestione de forma independiente una o varias tiendas, seleccionando la tienda activa en el dashboard sin mezclar datos ni acciones entre ellas.

## ADDED Requirements

### Requirement: Lista de tiendas del usuario
El sistema SHALL obtener todas las tiendas del usuario autenticado (`usuario_id = auth.uid()`). Si no tiene ninguna, SHALL mostrar el error "No tienes una tienda asignada".

#### Scenario: Usuario con una tienda
- **GIVEN** un usuario con una tienda activa
- **WHEN** accede al dashboard
- **THEN** se carga automáticamente esa tienda.

#### Scenario: Usuario sin tienda
- **GIVEN** un usuario sin filas en `tiendas`
- **WHEN** accede al dashboard
- **THEN** se muestra "No tienes una tienda asignada".

### Requirement: Selección de tienda activa
Si el usuario tiene más de una tienda, el sistema SHALL mostrar un selector. La selección SHALL persistirse (cookie o parámetro de ruta) y SHALL usarse en todas las operaciones del dashboard. Si tiene una sola, el selector SHALL ocultarse.

#### Scenario: Cambio de tienda activa
- **GIVEN** un usuario con 2 tiendas
- **WHEN** selecciona la tienda B en el selector
- **THEN** todas las vistas (productos, marcas, categorías, diseño, mi tienda) muestran los datos de la tienda B.

#### Scenario: Persistencia de la selección
- **GIVEN** una tienda B seleccionada
- **WHEN** el usuario recarga la página
- **THEN** la tienda B sigue seleccionada.

### Requirement: Validación de propiedad
Toda operación SHALL verificar que la tienda seleccionada pertenece al usuario autenticado (RLS). Una tienda ajena SHALL resultar en error de autorización.

#### Scenario: Tienda ajena
- **GIVEN** un usuario autenticado y un `tienda_id` que no le pertenece
- **WHEN** intenta operar sobre ella
- **THEN** el sistema retorna error de autorización.

### Requirement: Edición independiente por tienda
Las operaciones de guardado, eliminación, restauración, toggle de precios y diseño SHALL aplicarse únicamente a la tienda activa seleccionada, sin afectar a las demás tiendas del usuario.

#### Scenario: Guardar diseño en tienda activa
- **GIVEN** la tienda B seleccionada
- **WHEN** el usuario guarda un cambio de diseño
- **THEN** solo se actualiza la fila de la tienda B.

#### Scenario: Eliminación en tienda activa
- **GIVEN** la tienda B seleccionada
- **WHEN** el usuario elimina un producto
- **THEN** solo se marca eliminado el producto con `tienda_id = B.id`.

### Requirement: Aislamiento de caché por tienda
La invalidación de caché (revalidate) SHALL incluir la `tienda_id` en los tags para no invalidar la caché de otras tiendas.

#### Scenario: Revalidación acotada
- **GIVEN** un cambio en la tienda B
- **WHEN** se revalida
- **THEN** la caché de la tienda A no se invalida.
