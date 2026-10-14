# Spec Delta

## Purpose

Define cómo debe comportarse el layout del panel de administración (dashboard) en tablets y dispositivos móviles: riel de navegación, grillas, headers, tablas y legibilidad de los controles primarios en los temas claro y oscuro, usando un set canónico de breakpoints.

## ADDED Requirements

### Requirement: R-1 Riel de navegación izquierdo y ancho efectivo
El dashboard SHALL mostrar la navegación como un riel fijo de iconos a la izquierda en todos los anchos (80px en escritorio, 68px a ≤1024px de `globals.css`/`sidebar.css`), y el contenido principal SHALL desplazarse con un margen izquierdo igual al ancho del riel. Los targets táctiles del riel SHALL medir al menos 44×44px a ≤480px.

#### Scenario: Riel en un iPhone de 390px
- **GIVEN** un dispositivo de 390px de ancho con el dashboard autenticado
- **WHEN** se carga cualquier ruta del dashboard
- **THEN** el riel de iconos ocupa los 68px izquierdos, el contenido comienza después de él y la página NO tiene scroll horizontal

#### Scenario: Riel en escritorio
- **GIVEN** un viewport de 1280px
- **WHEN** se carga el dashboard
- **THEN** el riel mide 80px y el contenido respeta ese margen sin superponerse

### Requirement: R-2 Comportamiento idéntico entre rutas
Las clases compartidas del dashboard (header de página, título, panel, botones primarios y secundarios) SHALL comportarse igual en `/`, `/productos`, `/marcas`, `/diseno` y `/mi-tienda` para el mismo ancho: una única fuente de estilos base, sin reglas duplicadas con breakpoints distintos. El header de página SHALL apilarse verticalmente a ≤768px en TODAS las rutas.

#### Scenario: Header en Resumen vs Productos a 700px
- **GIVEN** un viewport de 700px
- **WHEN** se comparan `/` y `/productos`
- **THEN** ambos muestran el header apilado (título arriba, acciones abajo) con el mismo tamaño de título

#### Scenario: Botón primario idéntico en rutas distintas
- **GIVEN** el mismo ancho y tema en dos rutas distintas
- **WHEN** se renderiza el botón primario de cada ruta
- **THEN** comparten tamaño, padding, color de fondo y color de texto

### Requirement: R-3 Grillas de tarjetas adaptadas al ancho efectivo
Las tarjetas del Resumen SHALL pasar de 4 columnas (escritorio) a 2 (≤1024px) y a 1 (≤640px), considerando que el ancho efectivo del contenido es viewport menos riel menos padding. A 390px el valor y la etiqueta de cada tarjeta SHALL mostrarse completos, sin recorte ni desbordamiento.

#### Scenario: Tarjetas en iPhone SE (375px)
- **GIVEN** un viewport de 375px
- **WHEN** se carga el Resumen
- **THEN** las 4 tarjetas se apilan en una columna legible (antes: dos columnas de ~144px)

### Requirement: R-4 Tablas con scroll horizontal contenido
A ≤768px, los paneles de tabla (productos, marcas, categorías) SHALL permitir scroll horizontal DENTRO del panel para tablas anchas, sin provocar scroll horizontal a nivel de página.

#### Scenario: Tabla de productos a 480px
- **GIVEN** un viewport de 480px en `/productos`
- **WHEN** la tabla excede el ancho del panel
- **THEN** solo el panel de tabla tiene scroll horizontal y el resto de la página permanece fijo

### Requirement: R-5 Breakpoints canónicos del dashboard
El layout del dashboard SHALL reaccionar únicamente a los breakpoints 1024px, 768px, 640px y 480px. No SHALL existir reglas de layout a anchos fuera de ese set (eliminados 380px y cualquier otro valor puntual).

#### Scenario: Sin saltos intermedios
- **GIVEN** un viewport de 390px o de 500px
- **WHEN** se carga cualquier ruta
- **THEN** el layout coincide con el esperado para el breakpoint canónico más cercano hacia arriba (480px), sin reglas adicionales que alteren el resultado

### Requirement: R-6 Controles primarios legibles en ambos temas
El texto de los botones primarios, tabs activas y elementos con fondo `--db-btn-primary` SHALL cumplir contraste ≥4.5:1 contra su fondo en el tema claro Y en el tema oscuro (en oscuro el fondo es el verde menta `#4CE1AC`, por lo que el texto SHALL ser oscuro, no blanco).

#### Scenario: Botón primario en dark mode
- **GIVEN** el dashboard en tema oscuro
- **WHEN** se renderiza un botón primario (ej. "Nuevo producto")
- **THEN** el texto es oscuro sobre fondo menta y supera contraste 4.5:1

#### Scenario: Botón primario en light mode
- **GIVEN** el dashboard en tema claro
- **WHEN** se renderiza el mismo botón
- **THEN** el texto blanco sobre fondo verde oscuro supera contraste 4.5:1

### Requirement: R-7 Editor de diseño usable en móvil
En `/diseno` a ≤768px, el formulario y la vista previa SHALL apilarse en una sola columna, los campos en dos columnas SHALL pasar a una (≤640px), y la barra "Guardar cambios" SHALL permanecer visible mientras el formulario es scrolleable.

#### Scenario: Guardar en teléfono
- **GIVEN** un viewport de 390px en `/diseno`
- **WHEN** se edita un campo de la sección Banner
- **THEN** los campos están en una columna y la barra con "Guardar cambios" se mantiene visible al final del formulario
