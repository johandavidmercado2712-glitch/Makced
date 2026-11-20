# Impeccable Critique - Makced Store

**Target:** apps/store
**Date:** 2026-10-24
**Mode:** Persuade (e-commerce)

---

## Design Health Score

| # | Heurística | Score | Problema Clave |
|---|------------|-------|----------------|
| 1 | Visibilidad del Estado del Sistema | 3 | Carrito muestra badge con count, pero no hay feedback visual al agregar items |
| 2 | Match entre Sistema y Mundo Real | 3 | Lenguaje claro en español, pero "Novedades" podría ser más específico |
| 3 | Control y Libertad del Usuario | 2 | No hay forma de deshacer acciones (vaciar carrito sin confirmación) |
| 4 | Consistencia y Estándares | 2 | 91 findings de drift: 64 font-sizes, 9 radius, 18 colores fuera de tokens |
| 5 | Prevención de Errores | 2 | No hay validación de stock antes de agregar al carrito |
| 6 | Reconocimiento vs Recuerdo | 3 | Breadcrumbs presentes, navegación clara, pero filtros limitados |
| 7 | Flexibilidad y Eficiencia | 2 | Sin atajos de teclado, sin búsqueda avanzada, sin filtros por talla/color |
| 8 | Diseño Estético y Minimalista | 3 | Layout limpio, pero hero genérico (imagen + texto centrado) |
| 9 | Recuperación de Errores | 2 | Error pages existen pero no hay retry logic en server actions |
| 10 | Ayuda y Documentación | 1 | Sin tooltips, sin guía de tallas, sin info de envíos visible |
| **Total** | | **23/40** | **Acceptable** |

---

## Design Specificity Verdict

**LLM Assessment:**
La store tiene una identidad visual clara basada en mint/turquesa (#00E599), pero cae en patrones genéricos de e-commerce:
- Hero centrado con imagen + texto overlay (cliché)
- Product cards estándar sin diferenciación
- Layout predecible sin momentos de sorpresa
- Tipografía Figtree es buena pero no distintiva

**Detector Scan:**
91 findings confirman drift significativo del design system:
- 64 font-sizes hard-coded (deberían usar tokens --fs-*)
- 9 radius values fuera de la escala documentada
- 18 colores sin tokenizar

---

## Cognitive Load Assessment

**Checklist:**
- [x] Single focus: Home tiene secciones bien definidas
- [ ] Chunking: Filtros de categoría muestran todas las opciones sin agrupar
- [x] Grouping: Product cards agrupan información relevante
- [x] Visual hierarchy: Títulos destacados, precios claros
- [x] One thing at a time: Flujo de compra lineal
- [ ] Minimal choices: Carrito muestra todos los items sin paginación
- [ ] Working memory: No hay "productos vistos recientemente"
- [x] Progressive disclosure: Búsqueda aparece al hacer click

**Score:** 4/8 fallidos = **Carga cognitiva moderada**

---

## Priority Issues

### **[P0] No hay feedback visual al agregar al carrito**
**Qué:** El botón "Agregar al carrito" no muestra confirmación visual
**Por qué importa:** El usuario no sabe si la acción fue exitosa
**Fix:** Agregar toast notification con animación de spring + badge animation en navbar
**Comando:** `$impeccable animate`

### **[P1] Filtros de producto limitados**
**Qué:** Solo filtro de precio máximo, sin opciones de talla, color, ordenamiento
**Por qué importa:** Usuarios no pueden refinar búsqueda, abandonan si no encuentran lo que buscan
**Fix:** Agregar filtros por talla (chips), color (swatches), ordenamiento (dropdown)
**Comando:** `$impeccable layout`

### **[P1] 91 findings de design system drift**
**Qué:** 64 font-sizes, 9 radius, 18 colores hard-coded
**Por qué importa:** Inconsistencia visual, difícil mantenimiento
**Fix:** Migrar todos los valores a tokens CSS (--fs-*, --radius-*, --color-*)
**Comando:** `$impeccable extract`

### **[P2] Hero genérico y predecible**
**Qué:** Carousel con imagen + texto centrado, layout estándar
**Por qué importa:** No diferencia la marca, se siente como cualquier e-commerce
**Fix:** Layout asimétrico (texto izquierda, imagen derecha con ángulo), tipografía más distintiva
**Comando:** `$impeccable bolder`

### **[P2] Sin validación de stock**
**Qué:** Se puede agregar items al carrito sin verificar stock disponible
**Por qué importa:** Usuario completa checkout y luego se entera que no hay stock
**Fix:** Validar stock en server action, mostrar estado en product card
**Comando:** `$impeccable harden`

---

## Persona Red Flags

### **Alex (Power User)**
- No hay atajos de teclado (Ctrl+K para búsqueda, etc.)
- No hay "agregar rápido" desde lista de productos (solo desde detalle)
- Carrito no permite editar cantidades inline (debe ir a detalle)
- **Riesgo:** Alex se frustra y abandona después de 2-3 compras

### **Jordan (First-Timer)**
- No hay guía de tallas visible en producto
- No hay info de envíos/costos hasta el carrito
- Empty states genéricos ("No hay productos" vs "Aún no has agregado productos")
- **Riesgo:** Jordan abandona en el carrito al ver costos inesperados

### **Casey (Mobile User)**
- Filtros no son touch-friendly (sliders pequeños)
- Product grid no permite scroll horizontal en mobile
- Botón "Agregar al carrito" está abajo (lejos del pulgar en pantallas grandes)
- **Riesgo:** Casey tiene dificultad para completar compra en móvil

---

## Minor Observations

- Navbar usa `unoptimized` en Image component (performance hit)
- Carousel no tiene indicadores de progreso (dots o progress bar)
- Product cards no muestran "Nuevo" o "Destacado" badges
- Footer no tiene links a redes sociales configurables
- Breadcrumbs no muestran categoría actual en páginas de producto

---

## Questions to Consider

1. ¿Qué hace única a Makced vs otros e-commerce deportivos? El diseño actual no comunica diferenciación.
2. ¿El público objetivo es joven (18-30) o adulto (30-50)? El diseño actual es neutral, no habla a ningún grupo específico.
3. ¿Hay planes para agregar más categorías de productos? El layout actual no escala bien si hay 20+ categorías.
4. ¿Se considera agregar reviews/ratings? Los product cards no tienen espacio para esto.
5. ¿El carrito debería persistir entre sesiones? Actualmente usa localStorage, pero no hay sync con usuario autenticado.

---

## Recommended Actions

1. **`$impeccable extract`** - Consolidar 91 findings en tokens CSS
2. **`$impeccable animate`** - Agregar feedback visual al agregar al carrito
3. **`$impeccable layout`** - Mejorar filtros y búsqueda
4. **`$impeccable bolder`** - Rediseñar hero para diferenciación
5. **`$impeccable harden`** - Agregar validación de stock y errores
6. **`$impeccable polish`** - Pase final de calidad

---

**Score: 23/40 (Acceptable)**
**Next:** Proceed to Audit for technical verification
