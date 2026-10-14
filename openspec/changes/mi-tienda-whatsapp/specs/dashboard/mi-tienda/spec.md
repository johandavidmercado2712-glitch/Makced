# Spec Delta

## Purpose

Define el comportamiento de la página "Mi Tienda" del dashboard: paneles de información de cuenta y tienda, edición del número de WhatsApp de pedidos, y ausencia del panel de accesos rápidos.

## ADDED Requirements

### Requirement: Sin panel de accesos rápidos
La página "Mi Tienda" NO SHALL mostrar el panel "Accesos rápidos" (links a /diseno, /productos, ver tienda).

#### Scenario: Panel eliminado
- **GIVEN** el dashboard autenticado en `/mi-tienda`
- **WHEN** se carga la página
- **THEN** no existe ningún panel con el título "Accesos rápidos"

### Requirement: Panel editable de WhatsApp
La página SHALL mostrar un panel "Pedidos por WhatsApp" con un campo de entrada para el número de WhatsApp y un botón "Guardar". El panel SHALL ocupar la posición del grid que antes tenía "Accesos rápidos".

#### Scenario: Panel visible con campo
- **GIVEN** el dashboard autenticado en `/mi-tienda`
- **WHEN** se carga la página
- **THEN** existe un panel con título "Pedidos por WhatsApp" que contiene un input para el número y un botón Guardar

#### Scenario: Guardar número válido
- **GIVEN** el panel de WhatsApp con un número válido (8–15 dígitos, ej. `573001234567`)
- **WHEN** el usuario presiona Guardar
- **THEN** el número se persiste en la columna `whatsapp_numero` de la tabla `tiendas` y se muestra confirmación

#### Scenario: Número inválido
- **GIVEN** el campo con un valor que no cumple el formato (vacío, letras, >15 dígitos)
- **WHEN** el usuario presiona Guardar
- **THEN** NO se persiste nada y se muestra un mensaje de error de validación

#### Scenario: Valor inicial del campo
- **GIVEN** la tienda tiene un número guardado en `whatsapp_numero`
- **WHEN** se carga la página
- **THEN** el campo muestra el número existente

### Requirement: Resto de paneles sin cambio
Los paneles "Tu cuenta", "Tu tienda" y "Contraseña" SHALL conservar su contenido y comportamiento actual.

#### Scenario: Paneles intactos
- **GIVEN** el dashboard autenticado en `/mi-tienda`
- **WHEN** se carga la página
- **THEN** los paneles "Tu cuenta", "Tu tienda" y "Contraseña" muestran los mismos datos que antes del cambio
