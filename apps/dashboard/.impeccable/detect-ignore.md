# Impeccable Design Detector - Ignored Findings
# These are intentional design decisions that should not be flagged

## Bounce Easing Animations
# The bounce easing curves (cubic-bezier(0.34, 1.56, 0.64, 1)) are intentional
# delight animations for empty states, celebration toasts, and bulk actions.
# All animations respect prefers-reduced-motion: reduce.

app/db-base.css:320 bounce-easing
app/db-base.css:558 bounce-easing
app/db-base.css:536 bounce-easing
components/ProductTable.css:50 bounce-easing

## Google Fonts Dynamic Loader
# The useEditorDiseno.ts file dynamically loads Google Fonts for the design
# editor preview. This is expected behavior, not a design system violation.

components/diseno/useEditorDiseno.ts:70 design-system-font
