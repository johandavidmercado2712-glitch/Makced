---
name: Makced Dashboard
description: A clear, focused workspace for keeping a small store's catalog ready.
colors:
  action-green: "#10B981"
  action-green-hover: "#059669"
  action-green-dark-hover: "#34D399"
  action-text: "#0F172A"
  action-text-dark: "#0B0F19"
  brand-turquoise: "#00D2B4"
  brand-navy: "#102E85"
  canvas-light: "#F8FAFC"
  card-light: "#FFFFFF"
  card-hover-light: "#F1F5F9"
  border-light: "#E2E8F0"
  text-primary-light: "#0F172A"
  text-secondary-light: "#64748B"
  text-muted-light: "#64748B"
  canvas-dark: "#0B0F19"
  card-dark: "#1A1C21"
  card-hover-dark: "#1E293B"
  border-dark: "#2D3748"
  text-primary-dark: "#E2E8F0"
  text-secondary-dark: "#A0AEC0"
  text-muted-dark: "#718096"
  status-green-light: "#047857"
  status-green-dark: "#34D399"
  new-violet: "#7C53ED"
  new-violet-dark: "#A78BFA"
  new-violet-surface: "#7C53ED"
  new-violet-surface-dark: "#2E1065"
  new-violet-text-dark: "#C4B5FD"
  amber-light: "#92400E"
  amber-dark: "#FBBF24"
  amber-warn: "#F59E0B"
  amber-surface-light: "#FEF3C7"
  amber-surface-dark: "#422006"
  discount-orange-light: "#C2410C"
  discount-orange-dark: "#FB923C"
  discount-surface-light: "#FFF7ED"
  discount-surface-dark: "#431407"
  danger-light: "#B91C1C"
  danger-dark: "#F87171"
  summary-blue: "#2563EB"
  summary-blue-light: "#60A5FA"
  summary-blue-surface: "rgba(59, 130, 246, 0.12)"
  summary-blue-surface-strong: "rgba(59, 130, 246, 0.15)"
  summary-blue-surface-stronger: "rgba(59, 130, 246, 0.4)"
  summary-cyan: "#0891B2"
  summary-cyan-light: "#22D3EE"
  summary-cyan-surface: "rgba(6, 182, 212, 0.12)"
  summary-cyan-surface-strong: "rgba(6, 182, 212, 0.15)"
  summary-cyan-surface-stronger: "rgba(6, 182, 212, 0.4)"
  summary-magenta-light: "#A855F7"
  summary-magenta-surface: "rgba(96, 165, 250, 0.1)"
  summary-magenta-surface-strong: "rgba(96, 165, 250, 0.15)"
  summary-magenta-surface-stronger: "rgba(96, 165, 250, 0.2)"
  gold-badge: "#927000"
  overlay-black-8: "rgba(0, 0, 0, 0.08)"
  overlay-black-35: "rgba(0, 0, 0, 0.35)"
  overlay-black-50: "rgba(0, 0, 0, 0.5)"
  overlay-black-60: "rgba(0, 0, 0, 0.6)"
  black: "#000000"
  white: "#FFFFFF"
  preview-mint: "#00E599"
  preview-mint-light: "#4CE1AC"
  preview-mint-tint: "#A7F3D0"
  preview-mint-dark: "#052E24"
typography:
  display:
    fontFamily: "Figtree, sans-serif"
    fontSize: "30px"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  display-sm:
    fontFamily: "Figtree, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
  display-lg:
    fontFamily: "Figtree, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1.1
  h1:
    fontFamily: "Figtree, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
  h2-lg:
    fontFamily: "Figtree, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.3
  h2:
    fontFamily: "Figtree, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
  h3:
    fontFamily: "Figtree, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Figtree, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.3
  body-lg:
    fontFamily: "Figtree, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Figtree, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
  label-sm:
    fontFamily: "Figtree, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
  label-xs:
    fontFamily: "Figtree, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.4
  label-2xs:
    fontFamily: "Figtree, sans-serif"
    fontSize: "9px"
    fontWeight: 600
    lineHeight: 1.4
  metric:
    fontFamily: "Figtree, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.1
rounded:
  xs: "3px"
  sm: "6px"
  btn: "8px"
  nav: "9px"
  card-sm: "10px"
  md: "12px"
  lg: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.action-green}"
    textColor: "{colors.action-text}"
    rounded: "{rounded.btn}"
    padding: "10px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.action-green-hover}"
  button-primary-hover-dark:
    backgroundColor: "{colors.action-green-dark-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary-light}"
    rounded: "{rounded.btn}"
    padding: "9px 14px"
    height: "44px"
  input-text:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.btn}"
    padding: "10px 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.card-light}"
    rounded: "{rounded.md}"
    padding: "24px"
  card-dark:
    backgroundColor: "{colors.card-dark}"
    rounded: "{rounded.md}"
    padding: "24px"
  entity-card:
    backgroundColor: "{colors.card-light}"
    rounded: "{rounded.md}"
    padding: "0"
  status-chip:
    backgroundColor: "color-mix(in srgb, #047857 14%, #FFFFFF)"
    textColor: "{colors.status-green-light}"
    rounded: "{rounded.pill}"
  status-chip-dark:
    backgroundColor: "color-mix(in srgb, #34D399 14%, #1A1C21)"
    textColor: "{colors.status-green-dark}"
    rounded: "{rounded.pill}"
  navigation-active:
    backgroundColor: "color-mix(in srgb, #00D2B4 16%, #FFFFFF)"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.sm}"
  navigation-active-dark:
    backgroundColor: "color-mix(in srgb, #00D2B4 16%, #1A1C21)"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.sm}"
  toast:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  toast-celebration:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.md}"
  bulk-bar:
    backgroundColor: "color-mix(in srgb, #10B981 10%, #FFFFFF)"
    rounded: "{rounded.md}"
    padding: "10px 16px"
---

# Design System: Makced Dashboard

## Overview

**Creative North Star: "Taller de catálogo claro y enfocado"**

The dashboard is a calm working space for one person maintaining a real store catalog. It should feel practical, legible, and direct: product information stays visible, actions are easy to find, and the interface does not compete with the goods being managed. The Makced identity appears in precise turquoise details; action green is reserved for clear next steps.

The system uses quiet, closely related surfaces to preserve focus in both themes. Product imagery can carry the strongest color on a page, while typography, spacing, and status colors make the work easy to scan. Keep the familiar navigation and controls of an admin tool; the gallery character belongs in product presentation, not in a replacement for the working interface.

Delight is earned, not manufactured. Celebrations appear only at meaningful moments — the first product, a large batch operation, a completed onboarding step — and never interfere with the task at hand.

**Key Characteristics:**
- Focused catalog work with product identity and state visible at rest.
- Functional color: green for actions, turquoise for brand recognition, and distinct semantic colors for status.
- Quiet surfaces, compact controls, and consistent Spanish-language labels.
- Subtle motion that rewards progress without distracting from work.

## Colors

The palette is role-led: a confident action green and Makced turquoise sit against slate neutrals, with violet and warm accents reserved for product labels and meaningful status.

### Primary
- **Action Green** (#10B981 / dark hover #34D399): The primary action color for buttons and important calls to action; its text color changes with the active theme (#0F172A light, #0B0F19 dark).
- **Makced Turquoise** (#00D2B4): A restrained brand accent for the mark and selected navigation details, not a substitute for action green.
- **Deep Brand Navy** (#102E85): Reserved for the Makced mark and identity details.

### Secondary
- **Status Green** (#047857 light / #34D399 dark): Communicates active or successful states.
- **New Violet** (#7C53ED light / #A78BFA dark): Identifies products marked "Nuevo" and remains distinct from the brand accent.
- **Amber Warn** (#F59E0B): Used for countdown timers, progress warnings, and pending states in the design editor.

### Tertiary
- **Amber Highlight** (#92400E light / #FBBF24 dark): For featured or attention states only when that meaning is present.
- **Discount Orange** (#C2410C light / #FB923C dark): For discount-price information, never as a general action color.
- **Danger Red** (#B91C1C light / #F87171 dark): For destructive or error states. The light variant (#F87171) is used for hover states on delete buttons.

### Summary Icons
- **Summary Blue** (#2563EB light / #60A5FA dark): Icon background for the "Productos" summary card; use with paired surface tints.
- **Summary Cyan** (#0891B2 light / #22D3EE dark): Icon background for the "Marcas" summary card; use with paired surface tints.
- **Summary Magenta** (#A855F7 dark): Icon background for the "Cupones" summary card; use with paired surface tints.
- Each summary color has three surface tints (default, strong, stronger) for layered backgrounds. Dark mode uses higher opacity for equivalent visual weight.

### Rank Badges
- **Gold Badge** (#927000 light / #FBBF24 dark): The warm amber tone for the top-ranked featured product. Silver and bronze use CSS gradients, not standalone colors.

### Overlays
- **Overlay Black (8%):** Subtle shadow and hover overlays.
- **Overlay Black (35%):** Modal backdrop blur and depth shadows.
- **Overlay Black (50%):** Standard modal backdrop.
- **Overlay Black (60%):** Heavy backdrop for focused modal contexts.
- **White** (#FFFFFF): Used for toggle switch thumbs and other small elements that need a solid light color in both themes.

### Preview (Design Editor)
- **Preview Mint** (#00E599): Live-preview accent in the design editor, mirroring the store's primary color. Not for dashboard chrome.
- **Preview Mint Dark** (#052E24): Text color on preview-mint backgrounds.

### Neutral
- **Canvas:** The light (#F8FAFC) and dark (#0B0F19) page backgrounds.
- **Card Surface:** Raised work surfaces in each theme (#FFFFFF light, #1A1C21 dark).
- **Hover Surface:** A subtle surface shift for hover and grouped content (#F1F5F9 light, #1E293B dark).
- **Slate Text:** Primary (#0F172A / #E2E8F0), secondary (#64748B / #A0AEC0), and muted (#64748B / #718096) text colors maintain hierarchy in each theme.
- **Soft Border:** Separates panels and controls without creating heavy outlines (#E2E8F0 light, #2D3748 dark).

### Named Rules
**The Color-Has-a-Job Rule.** Action green means an action; semantic badge colors mean the state they label. Do not use them as decoration.

**The One-Theme-At-a-Time Rule.** Use the complete light or dark neutral set together; never mix light and dark surface tokens within one dashboard view.

**The No-Border Rule.** Logos, icons, and toggle buttons do not need outlines. The background surface and hover state provide sufficient definition.

## Typography

**Display Font:** Figtree (with sans-serif fallback)
**Body Font:** Figtree (with sans-serif fallback)

**Character:** Figtree keeps dense catalog information approachable without softening its hierarchy. Headings use confident weight and restrained negative tracking; labels and metadata stay compact and readable.

### Hierarchy
- **Metric** (800, 32px, 1.1 line-height): KPI values and summary card numbers.
- **Display LG** (800, 36px, 1.1 line-height): Large display for hero titles and responsive clamp endpoints.
- **Display** (750, 30px, 1.2 line-height, -0.03em tracking): Page titles and the main statement of each route.
- **Display SM** (700, 26px, 1.2 line-height): Secondary display for sub-page titles.
- **H1** (700, 24px, 1.25 line-height): Primary section headings.
- **H2 LG** (700, 21px, 1.3 line-height): Panel titles and prominent section labels.
- **H2** (700, 20px, 1.3 line-height): Section titles.
- **H3** (600, 18px, 1.3 line-height): Sub-section headings and card titles.
- **Title** (700, 16px, 1.3 line-height): Panel headings, card labels, and catalog summary numbers.
- **Body LG** (400, 15px, 1.5 line-height): Emphasized body text, prices in featured cards.
- **Body** (400, 14px, 1.5 line-height): Default body text, descriptions, form content, product names.
- **Body SM** (400, 13px, 1.5 line-height): Secondary body text, table cells, metadata, card labels (uppercase).
- **Label** (600, 12px, 1.4 line-height): Status, metadata, and compact control labels.
- **Label SM** (600, 11px, 1.4 line-height): Small badges and secondary labels.
- **Label XS** (600, 10px, 1.4 line-height): Tiny badges and numeric indicators.
- **Label 2XS** (600, 9px, 1.4 line-height): Mobile-only compact labels.

### Named Rules
**The Product-First Rule.** Keep names and prices readable before secondary metadata; do not reduce essential product information to hover-only content.

**The Required-Field Rule.** Mark required form fields with a red asterisk (*) next to the label. Use the danger-red token for the asterisk.

## Layout

The shell uses a fixed left navigation on desktop (272px), a narrower icon rail at intermediate widths (72px), and a fixed bottom navigation on small screens (64px height + safe-area-inset). The desktop rail keeps its own themed vertical scroll when the viewport is too short to show every destination and the account controls. The work area stays centered within a 1320px maximum width. At small widths, the page reserves room for bottom navigation and collapses multi-column work areas into a single readable flow.

Use a consistent 4px-based rhythm for compact icon gaps, control spacing, panel gaps, and section separation. Give the summary's product feature, supporting product grid, and catalog links distinct spacing so none compete or read as a single crowded block. On the store information screen, keep account details, store details, and related settings grouped with clear panel padding and row spacing; collapse columns when their container no longer has enough room. Keep filters close to the collection they scope.

Entity grids (brands, categories) use 3 columns on desktop, 2 on tablet, and 1 on mobile. On mobile, entity cards switch to a horizontal layout with the image on the left and content on the right.

The featured spotlight card uses a responsive grid: side-by-side on desktop (1.2fr image + 0.8fr copy), stacked vertically on mobile (image on top, copy below). The image uses `object-fit: contain` with padding to keep products fully visible without cropping.

**The Shell-Stays-Familiar Rule.** The dashboard keeps standard web navigation and controls at every breakpoint; responsive changes rearrange the work, not the interaction model.

## Elevation & Depth

The system is primarily flat. Panels use a quiet surface shift and a fine border to establish grouping; shadows are reserved for a meaningful selected or highlighted state. The featured-product spotlight uses a subtle ambient shadow (0 4px 16px overlay-black-8 light, 0 8px 24px overlay-black-35 dark) to draw attention without overwhelming. Entity cards gain a shadow on hover (0 4px 12px overlay-black-8) to reinforce interactivity.

### Shadow Vocabulary
- **Card rest:** No shadow; flat with border.
- **Card hover:** `0 4px 12px var(--db-overlay-black-8)` — subtle lift on entity cards and featured cards.
- **Spotlight:** `0 4px 16px var(--db-overlay-black-8)` light / `0 8px 24px var(--db-overlay-black-35)` dark — featured product emphasis.
- **Button hover:** `0 2px 8px var(--db-overlay-black-8)` — action green buttons gain depth on hover.
- **Toast:** `0 4px 16px var(--db-overlay-black-12)` — floating notifications.

### Named Rules
**The Flat-By-Default Rule.** Do not add a shadow to every card; use tonal layers and borders first. Shadows appear only as a response to state (hover, elevation, focus).

## Shapes

Controls use gently rounded corners, panels use a larger consistent radius, and status chips use a pill silhouette. Borders are thin and quiet. Avoid decorative geometry that makes an operational control look like a promotional element.

### Radius Scale
- **XS (3px):** Switches, micro-controls, and confetti particles.
- **SM (6px):** Tags, badges, small inline elements, and empty-state buttons.
- **Button (8px):** Buttons, inputs, interactive controls, and navigation items.
- **Nav (9px):** Sidebar navigation items and store logo (when used as avatar).
- **Card SM (10px):** Small cards and inner panels.
- **MD (12px):** Standard panels, cards, containers, and entity cards.
- **LG (20px):** Large badges, order status pills, and prominent rounded elements.
- **Pill (999px):** Status chips, toggle tracks, and progress bars.

## Components

### Buttons
- **Character:** Clear and direct, with visible hover, focus, and disabled states.
- **Primary:** Use the action-green token, theme-appropriate action text, an 8px corner radius, 10px 16px padding, and a 44px minimum height.
- **Hover / Focus / Press:** Shift to the theme's hover green; use the shared 2px focus ring with a 3px offset. Hover includes a subtle lift (-0.5px translateY) and a soft shadow (0 2px 8px overlay-black-8). Press feedback scales to 0.98 without shifting layout.
- **Secondary:** Transparent at rest with a soft border and secondary text; strengthen the border, text, and background on hover.
- **Icon button:** 44px circular or rounded-square button for refresh, close, and theme toggle. No border at rest; background shifts on hover.

### Toast Notifications
- **Character:** Floating notification at bottom-right with slide-in animation and progress bar countdown.
- **Default variant:** Card surface background, primary text, undo button with action-green tint.
- **Celebration variant:** Gradient background (card → card-hover), action-green border, PartyPopper icon in a gradient badge (action-green → preview-mint), bouncy entrance animation (0.6s cubic-bezier).
- **Countdown:** Progress bar at bottom shrinks from 100% to 0% over 5 seconds. Undo button shows numeric countdown (5, 4, 3, 2, 1). In the last 2 seconds, the undo button pulses (scale 1 → 1.05 → 1, 0.5s infinite).
- **Dismiss:** X button at right, no background at rest, card-hover on hover.
- **Accessibility:** `role="status"` and `aria-live="polite"`. All animations respect `prefers-reduced-motion`.

### Empty States
- **Character:** Centered layout with animated icon, step indicator (optional), title, description, and optional CTA.
- **Icon container:** 56px rounded square (12px radius) with a 10% action-green tint background. Icon animates with a subtle bounce on mount (0.6s ease-out, translateY 0 → -8px → 0).
- **Step indicator:** Uppercase, extra-small label (10px, 600 weight, 0.08em letter-spacing) in action-green.
- **Title:** Body-LG size, 600 weight, primary text.
- **Description:** Body-SM size, secondary text, 1.5 line-height.
- **Copy tone:** Conversational and welcoming. Start with "¡Hola!" when the section is empty. Explain what will appear there and why it matters.
- **Accessibility:** Bounce animation disabled when `prefers-reduced-motion: reduce`.

### Entity Cards (Brands, Categories)
- **Character:** Visual-first grid cards with large image area, name, status badge, and action buttons.
- **Grid:** 3 columns desktop, 2 tablet, 1 mobile. 20px gap desktop, 16px tablet, 14px mobile.
- **Visual area:** 16:9 aspect ratio, card-hover background, image uses `object-fit: contain` with 20px padding.
- **Content area:** 100px minimum height, 16px padding, flex row with heading on left and actions on right.
- **Heading:** Body size, 700 weight. Below the name, show slug (categories) or status badge.
- **Status badge:** Pill shape, secondary text on card-hover background. Active state uses status-green tint.
- **Hover:** -2px translateY lift, border shifts to action-green-hover, shadow appears (0 4px 12px overlay-black-8). Transition 180ms ease.
- **Mobile:** Horizontal layout with image on left (34% width) and content on right.

### Bulk Actions Bar
- **Character:** Floating bar that appears when products are selected, with count, action buttons, and optional status message.
- **Background:** 10% action-green tint on card surface, 1px border at 25% action-green.
- **Animation:** Slide-in from top with scale (0.98 → 1) over 200ms.
- **Count:** Body-SM size, 600 weight, primary text. Animates with a pop (scale 1 → 1.15 → 1, 0.3s) when count changes.
- **Buttons:** 32px height, 6px radius. Activate button uses status-green tint. Deactivate button is secondary. Clear button is transparent.
- **Confetti:** When bulk action affects 10+ products, show 5 confetti particles (action-green, preview-mint, amber) with staggered fall animation (1s). Particles are decorative only (`aria-hidden="true"`, `pointer-events: none`).

### Onboarding Panel
- **Character:** Guided setup shown when the catalog is empty, with progress bar and numbered steps.
- **Progress bar:** 6px height, pill radius, card-hover track, action-green fill. Transitions width over 0.4s.
- **Progress header:** Label on left (dynamic: "Comencemos" / "¡Buen comienzo!" / "¡Casi listo!" / "¡Tu catálogo está completo!"), count on right ("1/3").
- **Steps:** Numbered circles (32px, action-green tint background) with checkmark when completed. Completed steps dim to 60% opacity, title gets strikethrough, and CTA link hides.
- **Step content:** Title (body size, 600 weight), description (body-sm, secondary text), and CTA link (action-green, arrow icon that shifts right on hover).

### Product Table
- **Character:** Data table with checkboxes, selection highlighting, and hover animations.
- **Row hover:** Background shifts to card-hover, shadow appears (0 2px 8px overlay-black-8), avatar scales to 1.05. Transition 200ms.
- **Selected row:** 6% action-green tint background.
- **Checkbox:** 16px, action-green accent color.
- **Avatar:** 40px, 8px radius. Shows image or first letter of brand name on muted background.

### Chips
- **Style:** Compact, softly tinted pills with readable text.
- **State:** Green for active/success; violet for "Nuevo"; amber for a featured state when applicable; orange for discount information. Preserve semantic meaning in both themes.

### Cards / Containers
- **Corner Style:** 12px panels with a 1px neutral border (use `rounded.md`).
- **Background:** Use the active theme's card surface, not a hard-coded white in dark mode.
- **Shadow Strategy:** Flat by default; reserve ambient depth for hover and the featured-product emphasis.
- **Internal Padding:** 24px for a standard panel; reduce only when a compact mobile composition requires it.

### Inputs / Fields
- **Style:** Full-width fields with a theme-aware page surface, slate border, and 8px radius.
- **Focus:** Shift the border toward the action green and show the shared visible focus outline.
- **Disabled:** Reduce emphasis and keep the unavailable state explicit.

### Tooltip
- **Character:** Small floating label triggered by hover or focus on a help icon.
- **Trigger:** 20px circular button with HelpCircle icon, muted text, action-green tint on hover.
- **Bubble:** Positioned above trigger, primary text on card-dark background, 8px radius, max-width 240px. Slide-in animation (160ms, translateY 4px → 0).
- **Accessibility:** `role="tooltip"`, `aria-describedby` linking trigger to bubble. Visible on focus for keyboard users.

### Navigation
- **Desktop:** A fixed, light-weight rail (272px) with text labels and a quiet turquoise-tinted active state. Items gain a subtle border on hover.
- **Intermediate widths:** Keep destinations identifiable when the rail compacts to 72px icon rail; icons retain labels through accessible names and titles.
- **Mobile:** Use the fixed bottom bar with icon and concise labels such as "Marcas"; the accessible name retains the full destination label. The current destination receives the same restrained active treatment.
- **Theme control:** Keep the theme toggle available in the desktop shell (borderless, 44px) and preserve the selected preference across routes.
- **Store identity:** Logo at 44px (no border), store name in bold, owner name with "· Admin" subtitle.

### Product Cards (Featured Spotlight)
- **Character:** Product imagery leads recognition; product name, price, category, and status remain visible without hover.
- **Spotlight:** Responsive grid (side-by-side desktop, stacked mobile). Image uses `object-fit: contain` with 16-24px padding to keep products fully visible.
- **State:** "Nuevo", featured, discount, and stock indicators use their semantic color roles, not interchangeable decoration.

## Motion

All transitions use a 160-200ms duration with `ease` or `cubic-bezier(0.23, 1, 0.32, 1)` for natural deceleration. Hover lifts are subtle (-0.5px to -2px). Press feedback scales to 0.98.

### Animation Vocabulary
- **Entrance:** Slide-in with scale (0.96-0.98 → 1) for toasts and bars.
- **Bounce:** translateY 0 → -8px → 0 for empty-state icons (0.6s ease-out).
- **Pop:** Scale 1 → 1.15 → 1 for count changes (0.3s).
- **Pulse:** Scale 1 → 1.05 → 1 infinite for urgent buttons (0.5s).
- **Confetti:** Translate + rotate + scale with staggered delays (1s total).
- **Progress:** Width transition (0.4s cubic-bezier) for onboarding bar.

### Named Rules
**The Motion-Respects-Users Rule.** All animations must check `prefers-reduced-motion: reduce` and disable transforms, transitions, and keyframes. State changes must remain visible (color, opacity) even when motion is removed.

**The One-Authored-Moment Rule.** Each interaction gets one animation, not scattered effects. Avoid identical entrances on every section.

## Do's and Don'ts

### Do:
- **Do** use the active theme's page, card, text, and border tokens consistently.
- **Do** keep the Makced turquoise as a brand accent and action green as the primary action.
- **Do** make keyboard focus visible on buttons, links, and fields (2px solid focus ring, 3px offset).
- **Do** keep a visible-on-focus skip link and support arrow-key, Home, and End navigation in the design editor tabs.
- **Do** keep touch targets at least 44px high and remove press movement when reduced motion is requested.
- **Do** preserve product names, prices, categories, and status at mobile widths.
- **Do** use semantic color consistently for "Nuevo", active status, discounts, and destructive actions.
- **Do** add `fetchPriority="high"` and `decoding="async"` to above-the-fold images (logos, featured products).
- **Do** use `loading="lazy"` for below-the-fold images (product lists, brand grids).
- **Do** show a celebration toast when the user creates their first product.
- **Do** use conversational copy in empty states ("¡Hola! Aquí aparecerán tus productos").

### Don't:
- **Don't** apply dashboard palette changes to the public storefront or login.
- **Don't** use a KPI wall, invented sales metrics, or decorative data in place of catalog information.
- **Don't** hide essential product facts behind hover or truncate them without a usable way to read them.
- **Don't** make every panel elevated or use accent colors as ornament.
- **Don't** allow a child card, filter, or editor tab to create page-level horizontal overflow.
- **Don't** add borders to logos, toggle buttons, or icon-only controls.
- **Don't** use `Math.random()` during React render; use deterministic values or `useMemo` with stable keys.
- **Don't** show the same tooltip or celebration on every interaction; delight is earned, not automatic.
- **Don't** hard-code colors or font sizes; always use design tokens (`var(--db-*)`).
