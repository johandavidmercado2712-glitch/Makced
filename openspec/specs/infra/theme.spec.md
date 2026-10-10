# Infraestructura - Theme (Dark/Light Mode)

## Requirements

El sistema SHALL soportar modo oscuro y claro.

### R-1: CSS Variables
El sistema SHALL definir colores vía CSS variables (--color-bg, --color-text, etc.).

### R-2: Dark theme por defecto
El dashboard SHALL usar dark theme con variables --db-* (bg: #0B1120, cards: #1A1D23).

### R-3: Toggle de tema
El store SHALL tener un toggle para alternar entre dark y light mode.

### R-4: Persistencia
La preferencia de tema SHALL persistirse en localStorage.

## Scenarios

### S-1: Dark mode por defecto
WHEN el usuario abre el dashboard por primera vez
THEN SHALL ver el tema oscuro

### S-2: Toggle tema
WHEN el usuario hace click en el toggle de tema
THEN SHALL cambiar entre dark y light mode

### S-3: Persistencia
WHEN el usuario selecciona light mode y recarga la página
THEN SHALL mantener el tema light
