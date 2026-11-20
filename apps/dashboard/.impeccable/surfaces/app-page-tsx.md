---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/layout.tsx","app/productos/page.tsx","app/marcas/page.tsx","app/diseno/page.tsx","app/mi-tienda/page.tsx","components/sidebar.tsx"]
---

# Dashboard redesign

## Scope

The complete Makced dashboard shell and its five routes: Resumen, Productos, Marcas y categorías, Diseño, and Mi tienda. Mode: Operate.

## Audience and task

The primary user is a small-store owner, usually working alone, who sells footwear and may also sell clothing. They maintain product records, prices, and categories, then review how products will appear in the online store before publishing changes.

## Constraints

Preserve current product truth, Spanish-language interface, authentication, route behavior, data operations, and existing capabilities. Do not invent order or sales data. Keep the existing login and public storefront unchanged. For the dashboard, use the requested palette: action green `#10B981`, deep slate text `#0F172A`, secondary slate `#64748B`, light surfaces `#F8FAFC` / `#FFFFFF`, and borders `#E2E8F0`; retain Makced's turquoise as a brand accent.

## Direction contract

THESIS: Makced’s catalog is a product gallery that remains a working admin tool: imagery helps the owner recognize the footwear or clothing customers will see, while every record keeps its management data and actions immediately available. Refuse the generic KPI-wall dashboard and avoid hiding product facts behind hover.

OWN-WORLD: Use the selected streaming title-card wall only for its image-led product discovery, strong selected-item focus, and repeatable gallery rhythm. In the dashboard, use action green `#10B981`, deep slate `#0F172A`, secondary slate `#64748B`, pale `#F8FAFC`, white, and soft `#E2E8F0` borders, while retaining Makced turquoise `#00D2B4` for brand recognition. Dark mode uses blue-black `#0B0F19`, elevated charcoal `#1A1C21`, light slate text, and subtle slate borders. Map “Nuevo” to violet, featured/high-attention states to amber where semantically appropriate, and discounts to orange. In light mode, keep navigation on the same quiet surface as catalog cards, separated by a fine border. Keep typography and controls legible and consistent; product imagery is the principal color field, not an excuse for unrelated cinematic decoration.

STORY: The owner arrives at Resumen, recognizes what customers will see, and can open the relevant edit flow without hunting. Productos is the operational catalog with search and filters always visible, product details comparable at a glance, and edit actions available by keyboard and pointer. Marcas y categorías, Diseño, and Mi tienda retain their current functions within the same shell and visual system.

FIRST VIEWPORT: A stable left navigation names all five destinations. Resumen opens with a concise heading, a direct “Ver mi tienda” action, and a prominent image-led row/grid of real featured products with names, prices, categories, and status visible at rest; catalog totals remain secondary. Productos opens with “Nuevo producto”, search and filters, then a responsive image-led list/grid whose cards expose product identity, price, stock, category, and status without hover. No invented analytics or mock content appears in the live app.

FORM: The chosen challenger is `pop-culture-shelf-streaming-title-card-wall`, adapted to a footwear/apparel store admin; code-led build. The approved round sketch is `.impeccable/mocks/decision/round-2-gallery.html`. The selected concept and decision are recorded in `.impeccable/questions/dashboard-direction-round-2.json`. The surface span includes the shared dashboard shell and all five named routes.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

No live sales/order data is confirmed. Product imagery may be absent for some records; missing-image states must remain useful and honest. The storefront publication mechanism and its current limits must not be represented as a new workflow.
