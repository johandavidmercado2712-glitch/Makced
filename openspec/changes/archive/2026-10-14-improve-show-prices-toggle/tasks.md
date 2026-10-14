# Tasks

## 1. Header — usar db-header-actions

- [x] 1.1 En `apps/dashboard/app/productos/page.tsx`: reemplazar el `<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>` del header por `<div className="db-header-actions">`; verificar typecheck

## 2. Switch accesible con tokens

- [x] 2.1 Reescribir `apps/dashboard/components/ToggleShowPrices.tsx`: `<button role="switch" aria-checked aria-busy>` tipo pill, quitar estilos inline, mantener el `fetch` a `/api/settings/mostrar-precios` y el manejo de 401/403/5xx; verificar typecheck
- [x] 2.2 Agregar estilos del switch (`.toggle-precios`, thumb, estados on/off) en `productos.css` (o CSS del componente) usando tokens `--db-*`; sin estilos inline; verificar typecheck
- [x] 2.3 Agregar cleanup del `setTimeout` (useRef + useEffect return) para evitar setState tras desmontar; verificar typecheck

## 3. Verificación funcional

- [x] 3.1 Verificar persistencia: alternar el switch y confirmar con query que `tiendas.diseno.mostrar_precios` cambia y las demás claves del JSONB se conservan (read-modify-write)
- [x] 3.2 Verificar reflejo en store (consistencia eventual): con el flag persistido, confirmar que tras la ventana `revalidate` de una ruta del store (≤300s) los precios desaparecen de `ProductGrid`/`ProductCard` y el carrito recibe `showPrices` correcto; sin cambios de código en store
- [x] 3.3 Verificar estados de error: sesión expirada muestra "Sesión expirada..." sin alterar el switch; mensaje "Guardado" se auto-limpia y no hay warnings de setState tras desmontar en consola

## 4. Verificación final

- [x] 4.1 Correr `npm run typecheck` en la raíz del monorepo y verificar 3/3 paquetes exitosos sin errores
