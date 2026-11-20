---
name: Makced Store
description: Tienda pública de calzado y ropa deportiva del monorepo Makced.
colors:
  primary: "#00E599"
  primary-dark: "#0F474A"
  primary-light: "#E6FAF5"
  action: "#00E599"
  action-hover: "#00C985"
  on-action: "#121212"
  secondary-blue: "#A5C7FF"
  secondary-purple: "#7C53ED"
  secondary-purple-dark: "#532E9D"
  accent-star: "#FBBF24"
  whatsapp-green: "#25D366"
  text-primary: "#121212"
  text-secondary: "#64748B"
  text-muted: "#71717A"
  text-danger: "#EF4444"
  text-disabled: "#888888"
  bg-main: "#FAF9F6"
  bg-card: "#FFFFFF"
  bg-section: "#E6FAF5"
  bg-input: "#FFFFFF"
  bg-media: "#F5F5F0"
  bg-strong: "#121212"
  on-strong: "#FFFFFF"
  border: "#E2E8F0"
  focus-ring: "#059669"
  overlay-15: "rgba(0, 0, 0, 0.15)"
  overlay-20: "rgba(0, 0, 0, 0.2)"
  mint-overlay: "rgba(76, 225, 172, 0.25)"
typography:
  display:
    fontFamily: "Figtree, sans-serif"
    fontSize: "clamp(24px, 3vw, 34px)"
    fontWeight: 700
    lineHeight: 1.1
  h1:
    fontFamily: "Figtree, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  lg:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
  xl:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  2xl:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.3
  4xl:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
  ui:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
  xs:
    fontFamily: "Figtree, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  xs: "3px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "0.75rem"
  sm: "0.875rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
  section: "clamp(40px, 6vw, 80px)"
  content-width: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# DESIGN.md — Makced Store

## Overview

Makced Store es una tienda e-commerce de calzado y ropa deportiva. Su identidad visual se basa en un acento mint/verde sobre fondos claros y cálidos (crema #FAF9F6), con tipografía Figtree por defecto (configurable a Poppins, Montserrat, Inter o Roboto desde el panel de diseño). Soporta modo claro y oscuro, con tokens semánticos que se invierten en dark mode. La marca se transmite mediante el color de acción mint y las imágenes de producto; la UI se mantiene funcional y limpia.

**The Mint Accent Rule.** El mint (#00E599) es el único color de acción; el resto de la UI usa neutros cálidos y el turquesa oscuro (#0F474A) para texto y acciones secundarias. No introducir nuevos colores de acento.

## Colors

Paleta extraída de app/globals.css. Los valores light son los por defecto; en dark mode los tokens semánticos se redefinen (ver .dark).

- **Primary (mint):** #00E599 — color de acción principal, CTAs, enlaces destacados.
- **Primary dark (teal):** #0F474A — texto sobre fondos claros, acciones secundarias.
- **Primary light (mint tint):** #E6FAF5 — fondos de sección, hover sutil.
- **Secondary blue:** #A5C7FF — acento secundario (badges, categorías).
- **Secondary purple:** #7C53ED — acento terciario (promociones, highlights).
- **Accent star:** #FBBF24 — estrellas de rating, badges de oferta.
- **WhatsApp green:** #25D366 — botón de contacto WhatsApp.
- **Neutral bg main:** #FAF9F6 — fondo de página (crema cálido).
- **Neutral bg card:** #FFFFFF — superficies de tarjetas.
- **Neutral bg section:** #E6FAF5 — secciones alternas.
- **Neutral bg input:** #FFFFFF — campos de formulario.
- **Neutral bg media:** #F5F5F0 — placeholder de imágenes.
- **Neutral bg strong:** #121212 — fondos "tinta" de elementos seleccionados.
- **On strong:** #FFFFFF — texto sobre fondos fuertes.
- **Text primary:** #121212 — texto principal.
- **Text secondary:** #64748B — texto secundario.
- **Text muted:** #71717A — texto terciario (labels, precios tachados).
- **Text danger:** #EF4444 — errores y estados destructivos.
- **Text danger hover:** #dc2626 — hover de elementos destructivos.
- **Border:** #E2E8F0 — bordes y divisores.
- **Focus ring:** #059669 — anillo de foco (contraste ≥3:1 sobre fondos claros).

**The No-New-Accent Rule.** No agregar nuevos colores de acento fuera de la paleta documentada; reutilizar los tokens existentes.

## Typography

Fuente base Figtree (variable --font-figtree), con alternativas Poppins, Montserrat, Inter y Roboto seleccionables desde el panel de diseño (config.tipografia). Tamaño de fuente rem para respetar preferencias del usuario.

### Escala de tamaños

- **2xs:** 0.625rem (10px) — texto muy pequeño
- **2xs-11:** 0.6875rem (11px) — texto muy pequeño
- **xs:** 0.75rem (12px) — labels uppercase, captions
- **sm:** 0.8125rem (13px) — texto pequeño
- **15:** 0.9375rem (15px) — texto base pequeño
- **base:** 0.875rem (14px) — texto UI por defecto
- **md:** 1rem (16px) — párrafos
- **lg:** 1.125rem (18px) — texto destacado
- **xl:** 1.25rem (20px) — subtítulos
- **21:** 1.3125rem (21px) — subtítulos grandes
- **22:** 1.375rem (22px) — títulos pequeños
- **2xl:** 1.5rem (24px) — títulos de sección
- **26:** 1.625rem (26px) — títulos grandes
- **28:** 1.75rem (28px) — títulos grandes
- **3xl:** 2rem (32px) — títulos display
- **display:** clamp(24px, 3vw, 34px) — titulares de sección

Escala completa en --fs-2xs … --fs-display. El ancho de contenido se limita a --content-width (1200px).

## Layout

- **Content width:** 1200px máximo.
- **Section spacing:** clamp(40px, 6vw, 80px) entre secciones.
- **Responsive:** breakpoints implícitos vía Tailwind v4; carrusel horizontal con scroll-snap en mobile.
- **Grid de productos:** responsive (skeletons mientras carga).

**The Content-Width Rule.** El contenido nunca supera 1200px; el fondo se extiende al viewport.

## Elevation & Depth

Sombras sutiles y cálidas, sin exageración.

- **Shadow sm:** 0 2px 4px rgba(0,0,0,0.04) — elevación mínima.
- **Shadow card:** 0 10px 30px -5px rgba(15,23,42,0.05) — tarjetas de producto.
- **Shadow glow mint:** 0 8px 20px rgba(76,225,172,0.35) — hover de CTAs mint.
- **Shadow glow purple:** 0 0 25px rgba(124,83,237,0.30) — acentos purple (dark).

En dark mode las sombras se intensifican (rgba(0,0,0,0.3–0.35)).

## Shapes

- **Radius xs:** 3px — bordes muy sutiles
- **Radius sm:** 4px — bordes sutiles
- **Radius md:** 8px — botones, inputs
- **Radius lg:** 12px — tarjetas, paneles
- **Radius xl:** 16px — contenedores grandes
- **Radius full:** 9999px — pills, avatares, badges

**The Soft-Edge Rule.** Esquinas suaves (4–16px); evitar ángulos rectos en componentes interactivos.

## Components

- **Button primary:** fondo mint (action), texto oscuro (on-action), radius 8px, padding 12px 24px. Hover oscurece el mint 14%.
- **Card:** fondo blanco, radius 12px, padding 16px, sombra card.
- **Focus:** anillo de 3px mint/verde (focus-ring) con offset 3px en :focus-visible.
- **Carousel:** carrusel horizontal con scroll-snap, overlay oscuro 40% para texto.
- **Skeletons:** shimmer de daisyUI mientras carga contenido.

Motion: transiciones suaves (0.3s) para tema; scroll-reveal con opacity/translate (0.6s). Respeta prefers-reduced-motion (deshabilita animaciones y shimmer).

## Do's and Don'ts

**Do:**
- Usar los tokens semánticos (--bg-main, --text-primary, etc.) en lugar de valores hex directos.
- Respetar prefers-reduced-motion.
- Mantener el ancho de contenido ≤1200px.
- Usar mint solo para acciones primarias.

**Don't:**
- No introducir nuevos colores de acento fuera de la paleta.
- No usar ángulos rectos en componentes interactivos.
- No duplicar la lógica de tema/auth (vive en @makced/db).
- No sobrescribir DESIGN.md sin confirmación del usuario.
