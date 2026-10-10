# Dashboard - Diseño de la tienda

## Purpose

Permitir al administrador de Makced personalizar el aspecto visual y los textos de su tienda pública —colores, tipografía, redondeo, logo, banners, títulos y pie de página— desde la página `/diseno` del dashboard. La store pública SHALL consumir esa misma configuración desde la fila de la tienda activa para que los cambios se reflejen sin redeploy. Archivos clave: `apps/dashboard/components/diseno/EditorDiseno.tsx`, `apps/dashboard/actions/diseno.ts`, `packages/db/src/diseno.ts`, `apps/store/app/layout.tsx`, `apps/store/app/page.tsx`.

## Requirements

### Requirement: R-1 Acceso y secciones
`/diseno` SHALL mostrar 6 pestañas: **Estilo global**, **Logo**, **Banner principal**, **Banners de la home**, **H₁ Títulos de secciones** y **Pie de página**. Cada pestaña SHALL indicar dónde aparece su contenido en la tienda.

#### Scenario: Abrir la página de diseño
- **GIVEN** un administrador autenticado en el dashboard
- **WHEN** abre `/diseno`
- **THEN** SHALL ver las 6 pestañas (Estilo global, Logo, Banner principal, Banners de la home, H₁ Títulos de secciones y Pie de página)
- **AND** cada una SHALL indicar dónde aparece su contenido en la tienda

### Requirement: R-2 Persistencia por tienda
Todo SHALL guardarse en la fila de la tienda activa: `tiendas.diseno` (jsonb) más las columnas `color_principal` y `logo_url`. El `tienda_id` SHALL resolverse en el servidor (nunca venir del cliente) y cada guardado SHALL hacer read-modify-write del jsonb de UNA sola sección sin tocar las demás. El filtro SHALL ser `.eq("activa", true)` en ambos lados (dashboard y store).

#### Scenario: Guardar una sección no pisa las otras
- **GIVEN** que la tipografía es "Poppins"
- **WHEN** el admin guarda la pestaña Banner con palabras nuevas
- **THEN** los slides SHALL actualizarse
- **AND** `diseno.tipografia` SHALL seguir siendo "Poppins"

#### Scenario: El tienda_id se resuelve en el servidor
- **WHEN** el admin envía un guardado desde el navegador
- **THEN** el `tienda_id` SHALL resolverse en el servidor
- **AND** el filtro de la tienda SHALL ser `.eq("activa", true)` en dashboard y store

### Requirement: R-3 Estilo global
La pestaña Estilo SHALL ofrecer paletas rápidas (colorean `color_principal` y `color_secundario` a la vez), selector de color + hex validado con formato `#AABBCC`, redondeo de esquinas de 0 a 24 px y las tipografías Figtree, Poppins, Montserrat, Inter y Roboto. Al guardar se SHALL generar vía `varsDesdeConfig()`: `--primary-mint`, `--primary-turquoise`, `--radius-sm/md/lg` (8/12/5 × radio/12), `--shadow-glow-mint` y `--font-figtree`.

#### Scenario: Guardar estilo y verlo en la store
- **WHEN** el admin cambia el color principal a `#FF00AA` y guarda la pestaña Estilo
- **THEN** la DB SHALL tener `color_principal = #FF00AA`
- **AND** la store SHALL servir `--primary-mint:#FF00AA` en el `style` de `<html>` en menos de 60 segundos

#### Scenario: Paleta rápida colorea los dos a la vez
- **WHEN** el admin elige una paleta rápida
- **THEN** `color_principal` y `color_secundario` SHALL actualizarse juntos

### Requirement: R-4 Guardado por sección
Cada pestaña SHALL tener su propia barra con estado (`● Cambios sin guardar` / `Guardado ✓` / `Todo guardado`) y los botones **Descartar** y **Guardar cambios**, deshabilitados cuando no hay cambios. Cambiar de pestaña con cambios sin guardar SHALL pedir confirmación y, si se acepta, descartarlos. Las validaciones (hex, radio 0–24, tipografía, palabras obligatorias de slides, títulos y marca) SHALL ocurrir también en el servidor y, si fallan, NO modificar la DB.

#### Scenario: Color inválido no toca la DB
- **WHEN** el admin envía un color que no tiene formato `#AABBCC`
- **THEN** SHALL devolverse un error de validación
- **AND** la fila de `tiendas` SHALL quedar intacta

#### Scenario: Cambiar de pestaña con cambios sin guardar
- **GIVEN** que hay cambios sin guardar en la pestaña activa
- **WHEN** el admin pulsa otra pestaña
- **THEN** SHALL mostrarse una confirmación
- **AND** si se acepta, los cambios SHALL descartarse

### Requirement: R-5 Imágenes
Logo, los 3 slides del banner, el banner de colección y el de newsletter SHALL usar el selector genérico "Subir archivo / Pegar URL" (JPG/PNG/WebP, máximo 5 MB, con "Quitar imagen" y deshacer). Las claves SHALL guardarse en el bucket con prefijo `diseno/`. Al reemplazar o quitar una imagen, el archivo anterior del bucket SHALL borrarse (best-effort, solo claves propias `diseno/*`). Si el form no trae un campo de imagen, la imagen guardada SHALL conservarse.

#### Scenario: Reemplazar la imagen de un slide
- **WHEN** el admin sube una nueva imagen al slide 1 y guarda
- **THEN** la nueva clave SHALL quedar en `diseno.banner.slides[0].imagen_key`
- **AND** el archivo anterior del bucket SHALL borrarse

#### Scenario: Guardado sin campo de imagen
- **WHEN** el formulario de guardado no incluye campos de imagen de una sección
- **THEN** las imágenes guardadas de esa sección SHALL conservarse

### Requirement: R-6 Restaurar todo
El botón **Restaurar todo** SHALL pedir confirmación y volver al diseño original: `diseno = {}` (defaults del código en `packages/db/src/diseno.ts`), `color_principal = #4CE1AC`, `logo_url = null`, borrando los archivos `diseno/*` subidos.

#### Scenario: Restaurar todo
- **WHEN** el admin pulsa "Restaurar todo" y confirma
- **THEN** `diseno` SHALL quedar `{}`, `color_principal` SHALL volver a `#4CE1AC` y `logo_url` a null
- **AND** los archivos `diseno/*` del bucket SHALL borrarse

### Requirement: R-7 Vista previa en vivo
La columna derecha SHALL mostrar un mock de la pestaña activa dibujado con `varsDesdeConfig(borrador)` —es decir, con los cambios locales **sin aplicarlos** a la store—, con enlace "Ver tienda" y aviso de que los cambios se aplican al guardar. Si la tipografía no es Figtree, la preview SHALL inyectar la ficha de Google Fonts.

#### Scenario: Vista previa local
- **GIVEN** que el admin cambia el color principal en la pestaña Estilo
- **WHEN** observa la columna de vista previa
- **THEN** SHALL ver el mock con `varsDesdeConfig(borrador)` usando el cambio local
- **AND** la store pública NO SHALL reflejarlo hasta guardar

### Requirement: R-8 Consumo en la store
`apps/store/app/layout.tsx` SHALL inyectar las variables de `varsDesdeConfig()` como `style` de `<html>`, pisando `:root` y `.dark` (un solo color de marca para ambos temas) y SHALL añadir el `<link>` de Google Fonts cuando la tipografía no sea Figtree. El home SHALL leer de la config: slides del `CarouselNav`, H₁ de CATEGORIAS/PRODUCTOS y los dos `PanelInfo` (colección y newsletter). El Navbar SHALL mostrar el logo subido (`logo_url`) o, en su defecto, la marca editable (`pie.marca`); el Footer SHALL usar `pie.marca`, `pie.copyright`, `pie.mensaje` y las categorías activas de la DB. Si un slide quedó sin imagen, SHALL usar su imagen por defecto.

#### Scenario: Tipografía no predeterminada en la store
- **WHEN** el admin guarda "Poppins" como tipografía
- **THEN** la store SHALL incluir en su `<head>` el `<link>` de Google Fonts para Poppins
- **AND** `--font-figtree` apuntará a Poppins; con Figtree el link NO aparecerá

#### Scenario: Logo subido tiene prioridad en el Navbar
- **GIVEN** que la tienda tiene un logo subido (`logo_url`)
- **WHEN** un visitante abre la store
- **THEN** el Navbar SHALL mostrar ese logo; sin logo SHALL mostrar la marca de `pie.marca`

#### Scenario: Slide sin imagen usa la de por defecto
- **GIVEN** que un slide del banner quedó sin imagen
- **WHEN** la store renderiza el `CarouselNav`
- **THEN** ese slide SHALL mostrar su imagen por defecto

### Requirement: R-9 Propagación y fallback
Los cambios del dashboard SHALL reflejarse en la store en menos de 60 segundos (`revalidate = 60` del home). Si no hay tienda activa, la store SHALL renderizar con los defaults sin caerse.

#### Scenario: Propagación en menos de 60 segundos
- **WHEN** el admin guarda un cambio en el dashboard
- **THEN** la store SHALL reflejarlo en menos de 60 segundos

#### Scenario: Sin tienda activa
- **GIVEN** que ninguna fila de `tiendas` tiene `activa = true`
- **WHEN** un visitante abre la store
- **THEN** la home SHALL renderizar con los defaults (colores, textos e slides de `DEFAULT_DISENO`) sin error
