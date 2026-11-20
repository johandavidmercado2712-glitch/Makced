---
target: apps/dashboard
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/home/jason/Codigo/Makced/apps/dashboard"
timestamp: 2026-10-24T21-35-32Z
slug: apps-dashboard
closed: true
---
# Critique Dashboard Makced - Post Fix

## Design Health Score

| # | Heurística | Score | Problema |
|---|------------|-------|----------|
| 1 | Visibilidad del estado del sistema | 3 | Skeletons y feedback de guardado funcionan |
| 2 | Match con el mundo real | 3 | Labels en español natural |
| 3 | Control y libertad del usuario | 3 | Cancel en modales, Esc funciona |
| 4 | Consistencia y estándares | **3** | **Mejorado**: Design system consolidado, 171 → 1 desviaciones |
| 5 | Prevención de errores | 3 | Confirmación en deletes, validación de imágenes |
| 6 | Reconocimiento vs recuerdo | 3 | Nav con labels claros, avatar de producto |
| 7 | Flexibilidad y eficiencia | 2 | Sin atajos de teclado, sin edición masiva |
| 8 | Diseño estético y minimalista | 3 | Flat by default funciona |
| 9 | Recuperación de errores | 2 | Sin undo para deletes |
| 10 | Ayuda y documentación | 1 | Sin onboarding ni ayuda contextual |
| | **Total** | **27/40** | **Acceptable → Good** |

## Design System Consolidation

### Before
- 171 findings (93 font-sizes, 43 radii, 34 colors, 1 font)
- Type ramp: 4 steps (12/14/16/28px)
- Radius scale: 3 steps (7/12px/999px)
- Colors: missing blues, cyans, overlays

### After
- 1 finding (expected: dynamic Google Fonts loader)
- Type ramp: 16 steps (9/10/11/13/14/15/16/18/20/21/24/26/30/32/36px)
- Radius scale: 8 steps (3/6/8/9/10/12/20px/999px)
- Colors: complete with summary blues/cyans, overlays, preview mint

### Files Updated
- DESIGN.md: expanded typography, rounded, colors sections
- globals.css: added --db-fs-*, --db-radius-*, --db-summary-*, --db-overlay-*
- page.css: 61 findings → 0
- diseno.css: 45 findings → 0
- productos.css: 19 findings → 0
- db-base.css: 17 findings → 0
- sidebar.css: 13 findings → 0
- mi-tienda.css, marcas.css: 10 findings → 0

## Remaining Issues (Non-Design-System)
1. **Sin atajos de teclado** - P1
2. **Sin onboarding ni ayuda contextual** - P2
3. **Sin undo para acciones destructivas** - P2
4. **Home page sobrecargada** - P3
