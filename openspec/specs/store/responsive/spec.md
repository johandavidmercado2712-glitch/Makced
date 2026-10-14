# Spec

## Purpose

Define cómo debe comportarse la tienda pública en dispositivos móviles: navegación alcanzable con targets táctiles, grids y carruseles sin desbordes, animaciones que respetan las preferencias del sistema y un set canónico de breakpoints.

## Requirements

### Requirement: R-1 Navegación móvil alcanzable y con affordance
A ≤768px (`navbar.css`), los links de sesión de la navbar SHALL permanecer en una tira horizontal scrolleable con affordance visible de scroll (degradados en los bordes que indiquen contenido oculto). A ≤480px, todos los controles interactivos de la navbar (logo, links, iconos) SHALL tener targets táctiles de al menos 44×44px. La navbar NO SHALL provocar scroll horizontal de la página.

#### Scenario: Links de sesión en 390px
- **GIVEN** un iPhone de 390px abriendo la store
- **WHEN** la navbar muestra la tira de links de sesión
- **THEN** el usuario ve un indicador visual de que hay más links scrolleables y cada link tiene área táctil ≥44px de alto

### Requirement: R-2 Grillas y carruseles sin desbordes
Los grids de productos SHALL pasar de 4 columnas (escritorio) a 3 (≤1024px) y a 2 (≤768px, manteniéndose en 2 a 480px) usando unidades que eviten desbordes. Las filas horizontales de categorías a ≤480px SHALL usar scroll-snap con tarjas de ~72% del viewport.

#### Scenario: Grid de productos a 480px
- **GIVEN** un viewport de 480px en la home
- **WHEN** se renderiza la grilla de productos
- **THEN** hay dos columnas por fila sin desbordar el contenedor

#### Scenario: Fila de categorías a 390px
- **GIVEN** un viewport de 390px
- **WHEN** se hace scroll horizontal en una fila de categorías
- **THEN** las tarjas se enganchan (snap) y caben ~1.3 tarjas en pantalla como mínimo

### Requirement: R-3 Animaciones con prefers-reduced-motion
Cuando el sistema del usuario declara `prefers-reduced-motion: reduce`, los elementos con animación de aparición al scroll (`scroll-reveal`) SHALL mostrarse inmediatamente en su estado final, sin desplazamiento ni transición. Con la preferencia ausente, el comportamiento de animación actual se conserva.

#### Scenario: Usuario con movimiento reducido
- **GIVEN** un dispositivo con "reducir movimiento" activado
- **WHEN** se carga la home de la store
- **THEN** todo el contenido es visible de inmediato, sin animaciones de entrada

### Requirement: R-4 Breakpoints canónicos de la store
El layout de la store SHALL reaccionar únicamente a 1024px, 768px y 480px. Los breakpoints puntuales restantes (360px en `marcas.css`) SHALL plegarse en 480px.

#### Scenario: Sin reglas fuera del set
- **GIVEN** cualquier viewport de la store
- **WHEN** se inspeccionan las hojas de estilo de la app store
- **THEN** no existen media queries de layout fuera de {1024, 768, 480}
