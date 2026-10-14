# Spec Delta

## Purpose

Define cómo el store usa el número de WhatsApp de la tienda en el botón "Pedir por WhatsApp" del carrito, para que los pedidos lleguen directamente al chat del vendedor.

## ADDED Requirements

### Requirement: Botón de pedido con número de WhatsApp
El botón "Pedir por WhatsApp" del carrito SHALL usar `https://wa.me/{whatsapp_numero}?text={mensaje}` cuando la tienda tiene un número configurado en `whatsapp_numero`.

#### Scenario: Tienda con número configurado
- **GIVEN** la tienda tiene `whatsapp_numero = "573001234567"`
- **WHEN** el usuario hace clic en "Pedir por WhatsApp" en el carrito
- **THEN** el enlace abre `https://wa.me/573001234567?text={mensaje codificado}`

### Requirement: Fallback sin número
Cuando la tienda NO tiene número configurado (`whatsapp_numero` es null o vacío), el botón SHALL mantener el comportamiento actual: `https://wa.me/?text={mensaje}` (abre WhatsApp sin número específico).

#### Scenario: Tienda sin número
- **GIVEN** la tienda tiene `whatsapp_numero = null`
- **WHEN** el usuario hace clic en "Pedir por WhatsApp"
- **THEN** el enlace abre `https://wa.me/?text={mensaje codificado}` (sin número)
