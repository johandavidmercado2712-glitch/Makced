# Makced — Guía de presentación del proyecto

> Documento para presentar el proyecto a un público técnico: qué es, cómo funciona
> por dentro, qué temas estudiar para entenderlo y en qué orden explicarlo.

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura general](#2-arquitectura-general)
3. [Cómo funciona: los 6 subsistemas](#3-cómo-funciona-los-6-subsistemas)
4. [Recorrido completo: "crear un producto"](#4-recorrido-completo-crear-un-producto)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Seguridad](#6-seguridad)
7. [Testing y calidad](#7-testing-y-calidad)
8. [Proceso de desarrollo (OpenSpec)](#8-proceso-de-desarrollo-openspec)
9. [Temario: qué estudiar para entender el proyecto](#9-temario-qué-estudiar-para-entender-el-proyecto)
10. [Guion de presentación (45 min)](#10-guion-de-presentación-45-min)
11. [Preguntas frecuentes en una defensa](#11-preguntas-frecuentes-en-una-defensa)
12. [Roadmap y deudas conocidas](#12-roadmap-y-deudas-conocidas)

---

## 1. Resumen ejecutivo

**Makced** es una plataforma **e-commerce multi-tienda** para calzado y ropa
deportiva. Un propietario crea su tienda desde un panel de administración y la
comparte con sus clientes por **WhatsApp** (el checkout no cobra: genera un
mensaje de pedido).

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript 5.
- **Monorepo:** Turborepo + npm workspaces.
- **Backend (BaaS):** [InsForge](https://insforge.dev) — Postgres, Auth,
  Storage, edge functions. Un único proyecto: **Makced-Store**.
- **Estilo:** Tailwind v4 + DaisyUI en la store; CSS propio con tokens `--db-*`
  en el dashboard.
- **Proceso:** desarrollo *spec-driven* con OpenSpec.

| App | Paquete | Puerto | Rol |
|---|---|---|---|
| Tienda | `@makced/store` | 3000 | Tienda pública (catálogo, búsqueda, carrito, WhatsApp) |
| Login | `@makced/login` | 3001 | Autenticación (login, registro, OTP, OAuth, reset) |
| Dashboard | `@makced/dashboard` | 3002 | Panel de administración (protegido) |

| Paquete | Rol |
|---|---|
| `@makced/db` | Clientes InsForge (anónimo y de sesión), server actions de auth, proxy/CSP, refresh de cookies, modelo de diseño |
| `@makced/ui` | `LoginForm`, `ResetPasswordForm`, `PasswordField` |

**La idea central en una frase:** *tres aplicaciones separadas comparten un solo
backend, y el aislamiento entre tiendas se resuelve en la base de datos (RLS) y
en el middleware (rewrites), no en el enrutamiento del framework.*

---

## 2. Arquitectura general

```
                        ┌──────────────────────────────────────┐
   Cliente (navegador)  │            InsForge (BaaS)           │
 ┌──────────────────┐   │  Postgres + RLS │ Auth (JWT) │ Storage│
 │  :3000  STORE    │──▶│  https://253fnuce.us-east.insforge.app│
 │  público/ISR     │   └──────────────────────────────────────┘
 ├──────────────────┤                 ▲
 │  :3001  LOGIN    │─────────────────┤  anon key (lectura pública)
 │  force-dynamic   │                 │  session client (escritura, RLS)
 ├──────────────────┤                 │
 │  :3002 DASHBOARD │─────────────────┘
 │  protegido       │──POST /api/revalidate──▶ store (invalida caché)
 └──────────────────┘
        ▲
        │  shared: @makced/db  (client | server | actions | proxy | refresh | diseno)
        │  shared: @makced/ui  (LoginForm | ResetPasswordForm)
```

### Decisiones arquitectónicas clave (y por qué)

| Decisión | Motivo |
|---|---|
| **3 apps separadas** en vez de 1 | Seguridad por dominio: el dashboard (sesión, CSP con nonce) no comparte runtime con la store (ISR, anónimo). Un XSS en la store no toca el panel. |
| **Store con ISR**, login/dashboard con render dinámico | Rendimiento en el catálogo; los otros dos ya dependen de la sesión. |
| **CSP estática en store, con nonce en login/dashboard** | El nonce exige render dinámico: aplicarlo a la store rompería el ISR. Es un intercambio documentado. |
| **Cliente anónimo en la store, de sesión en el dashboard** | RLS aplica `auth.uid()` solo si el request lleva el JWT de usuario. |
| **Multi-tenancy por rewrite (`/s/:subdominio`) hoy, subdominios reales mañana** | Permite desarrollar multi-tienda sin comprar ni configurar DNS todavía. |
| **Carrito en `localStorage` con store externo propio** | No hay backend de carrito (tablas `carrito` están en desuso); cero coste de servidor y funciona sin sesión. |

---

## 3. Cómo funciona: los 6 subsistemas

### 3.1 Multi-tenancy — el concepto central

El middleware `apps/store/proxy.ts` intercepta cualquier `/s/:subdominio/...`:

```ts
// apps/store/proxy.ts
const match = pathname.match(/^\/s\/([^/]+)(\/.*)?$/);
if (match) {
  const subdominio = decodeURIComponent(match[1]);
  const rest = match[2] || "/";
  url.pathname = rest === "/" ? "/" : rest;
  requestHeaders.set("x-tienda-subdominio", subdominio);
  const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  res.cookies.set("tienda-subdominio", subdominio, { path: "/", sameSite: "lax" });
  return res;          // el usuario ve /s/mi-tienda, el servidor ve /
}
```

**Puntos a destacar:**

- Es un **`rewrite`, no un `redirect`**: la URL no cambia en el navegador.
- El subdominio viaja en **dos vías**: header `x-tienda-subdominio` (fiable por
  request) y **cookie** como *fallback* para server components donde `headers()`
  no siempre está disponible.
- `apps/store/lib/tenant.ts` → `resolverTienda()` hace la consulta:

```ts
insforge.database.from("tiendas")
  .select("id, nombre_tienda, subdominio, color_principal, logo_url, diseno")
  .eq("subdominio", subdominio)
  .eq("activa", true)
  .maybeSingle();
```

- **Si el subdominio no existe → `notFound()`** (404, no filtra que la tienda
  exista).
- **Si no hay subdominio** (raíz) → `redirect()` a la primera tienda activa.
- El resultado se cachea con `combinarDiseno(data.diseno)`: un **merge profundo
  del JSONB guardado con `DEFAULT_DISENO`**, para que campos nuevos de diseño
  no rompan tiendas creadas antes.

**Aislamiento:** *todas* las queries de la store filtran por `tienda.id`. No hay
ninguna consulta que pueda devolver datos de otra tienda.

**Personalización por tienda:** `varsDesdeConfig()` traduce la config a
**variables CSS** inyectadas en `<html>` (color principal, radios, sombras,
tipografía de 5 opciones), más `color_principal` y `logo_url`.

### 3.2 Lectura en la store (rendimiento)

Flujo de una página:

1. **Server Component** por defecto.
2. Fetch con el **cliente anónimo** (`apps/store/lib/insforge.ts`).
3. Envuelto en `fetchWithRetry` (`lib/fetch-utils.ts`): timeout de 10 s,
   2 reintentos, backoff exponencial → una red lenta no tira la página.
4. `safeQuery()` devuelve `null` en vez de lanzar (ignora `PGRST116` = 0 filas).
5. **Caché en dos capas:**
   - `unstable_cache` con **tags** (`productos`, `categorias`, `marcas`,
     `nav-categorias`, `tiendas`, `diseno`) y `revalidate: 300`.
   - `revalidate` de página: 30 s (listados), 120 s (categorías), 300 s (marcas).
6. **`<Suspense>` por sección** con su propio skeleton → el banner no espera al
   catálogo.

| Ruta | Caché |
|---|---|
| `/` | `force-dynamic` (resuelve tenant en cada request) |
| `/categoria` | `revalidate = 120` |
| `/categoriaProductos`, `/marcasProductos`, `/novedades` | `revalidate = 30` |
| `/marcas` | `revalidate = 300` |
| `/verProducto` | dinámico por `searchParams` |
| `/carrito` | Client Component + `robots: noindex` |

**Skeletons:** la store usa `skeleton` de daisyUI; el dashboard usa `.db-skeleton`
con tokens `--db-*` (sin daisyUI). Regla fija: *no mezclar*. Todo estado de carga
lleva `role="status"`, `aria-busy="true"` y texto oculto para lectores de pantalla.

### 3.3 Escritura en el dashboard (sesión + RLS)

**Doble gate de autenticación:**

```ts
// apps/dashboard/app/layout.tsx — gate de la ruta
const user = await getCurrentUser();
if (!user) redirect(LOGIN_URL);
```

```ts
// apps/dashboard/actions/tienda.ts — gate de CADA server action
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return { tienda: null, tiendas: [], error: "No autorizado." };

  const insforge = createServerClient({ cookies: await cookies() }); // ← cliente de SESIÓN
  const { data } = await insforge.database.from("tiendas")
    .select("id, diseno, color_principal, logo_url")
    .eq("activa", true)
    .eq("usuario_id", user.id);   // RLS además lo verifica
  ...
}
```

> **Momento clave para explicar:** el layout redirige, pero eso es UX, no
> seguridad. La seguridad real es `requireAuth()` + cliente de sesión + RLS.
> Un `curl` a la action sin cookie no pasa.

**Patrón de cada server action:**
`requireAuth()` → operación → `revalidatePath()` → (si toca la store)
`invalidarCacheTienda()`.

**Multi-tienda del lado dueño:** el usuario puede tener varias tiendas; la
activa se guarda en la cookie `tienda-activa` (30 días, `httpOnly`) vía
`setTiendaActiva()`, y `requireAuth()` la resuelve de esa cookie.

### 3.4 Carrito y WhatsApp (patrón propio, sin librerías)

`apps/store/components/auth/CartContext.tsx` implementa un **store externo a
mano** sobre `localStorage` (clave `makced-cart`), conectado con
`useSyncExternalStore`:

```ts
function subscribe(listener) { listeners.push(listener); ... }   // suscripción
function getSnapshot() { /* lee localStorage con cache por referencia */ }
function getServerSnapshot() { return EMPTY }                     // SSR estable
function write(next) { cache = next; localStorage.setItem(...); emitChange() }
```

**Detalles que vale la pena señalar:**

- **`getServerSnapshot` devuelve `[]`** → el HTML del servidor coincide con el
  primer render del cliente y no hay *hydration mismatch*.
- **`getSnapshot` cachea por referencia** → si el string no cambió, devuelve el
  mismo array; React exige referencias estables o entra en bucle infinito.
- **Validación de forma** (`esCartItem`) al leer: un `localStorage` corrupto o
  manipulado no rompe la app.
- **Sincronización entre pestañas** con el evento `storage`.
- **Fallback en memoria** si `localStorage` está bloqueado (modo privado).
- Deduplica por `id + talla + color`; el precio usa `precioEfectivo()`
  (prioriza `precio_descuento`).

**Checkout → WhatsApp:** `CarritoResumen.tsx` construye
`https://wa.me/{numero}?text={mensaje}` con el detalle del pedido. Si la tienda
no tiene número configurado, el botón queda `aria-disabled` y el click no hace
nada. Regla de envío: gratis desde $200.000, si no $15.000.

> El toggle **`mostrar_precios`** (guardado en `tiendas.diseno`) oculta precios en
> toda la store — detalle, grid, filtro y hasta el mensaje de WhatsApp.

### 3.5 Editor de diseño (el módulo más visual)

`apps/dashboard/app/diseno` → `EditorDiseno.tsx` (~400 líneas), 6 pestañas:
`estilo · logo · banner · promo · titulos · pie`, con **preview en vivo** que
aplica `varsDesdeConfig()` en tiempo real.

Separado en 3 hooks (`components/diseno/useEditorDiseno.ts`):

| Hook | Responsabilidad |
|---|---|
| `useEditorEstado` | borrador, *baseline* por sección → flag `sucio`, fases `idle/subiendo/guardando/restaurando`, carga de Google Fonts para la preview |
| `useEditorSeccion` | cambiar de pestaña con confirmación si hay cambios sin guardar |
| `useEditorGuardar` | sube imágenes en paralelo → `guardarDiseno` → `router.refresh()` |

La server action `actions/diseno.ts` hace **read-modify-write del JSONB**
`tiendas.diseno`: solo reescribe las claves de la sección editada, sin pisar las
otras cinco. Valida hex, radio 0–24, tipografía y URLs del pie con
`esUrlPieValida()` (bloquea `javascript:` y `data:`).

### 3.6 Invalidación de caché entre apps

Como store y dashboard son apps separadas, **no comparten caché de Next**.
Solución: el dashboard avisa a la store por HTTP.

```
dashboard: guardarDiseno() / guardarMarca() / toggle precios
   └─▶ POST {NEXT_PUBLIC_TIENDA_URL}/api/revalidate
          header: x-revalidate-secret = REVALIDATE_SECRET
              └─▶ store: revalidateTag("diseno" | "productos" | "tiendas")
```

Con `REVALIDATE_SECRET` ausente (desarrollo) se omite la llamada. Es un patrón
reutilizable y un buen tema de conversación en una defensa.

---

## 4. Recorrido completo: "crear un producto"

El mejor hilo conductor para una demostración — toca todas las capas:

1. **Login** (`:3001`) → `LoginForm` (`@makced/ui`) → server action `signIn` →
   cookie `insforge_access_token` / `insforge_refresh_token`.
2. **Redirect al dashboard** (`:3002`) → `app/layout.tsx` → `getCurrentUser()`
   → OK → render.
3. **`/productos`** → server component lee `searchParams` → `getProductosPaginado()`
   (count exacto + `.range()`).
4. **"Nuevo producto"** → modal (`components/modal/modalProduct.tsx`) →
   `guardarProducto()`:
   - `requireAuth()` → cliente de sesión → RLS verifica pertenencia.
   - `generarSlugUnico()` (evita colisiones por tienda).
   - Si hay imagen: `subirImagenEnForm()` → Storage bucket `productos` →
     persiste **`url` y `key`**.
   - `insert` / `update` filtrando por `tienda_id`.
   - `revalidatePath("/productos")` + `invalidarCacheTienda(["productos"])`.
5. **La store (`:3000`)** recibe el `revalidateTag` → el próximo request regenera
   el HTML → el producto aparece.
6. **Cliente:** lo busca (debounce 300 ms → server action `buscarProductos` con
   `ilike`), entra al detalle, lo agrega al carrito → `localStorage` → pide por
   WhatsApp.

---

## 5. Modelo de datos

Esquema base: `apps/store/migrations/20260910231753_makced-schema.sql`.

```
auth.users (InsForge)
   └─ tiendas(usuario_id, nombre_tienda, subdominio UNIQUE, plan_actual,
              color_principal, logo_url, diseno JSONB, whatsapp_numero,
              activa, propietario, plantilla_id, created_at, updated_at)
        ├─ productos(tienda_id, nombre, slug, precio, precio_descuento, stock,
        │            imagen_url, imagen_key, estado, es_nuevo, es_destacado,
        │            colores, referencia, marca_id, categoria_id, eliminado_en)
        ├─ categorias(tienda_id, nombre, slug UNIQUE por tienda, imagen_url,
        │            activa, eliminado_en)
        ├─ marcas(tienda_id, nombre, logo_url, logo_key, imagen_url,
        │        activa, eliminado_en)
        ├─ pedidos(tienda_id, cliente_*, subtotal, total, estado_pedido)
        │     └─ detalles_pedido(pedido_id, producto_id, cantidad, precio_unitario)
        └─ cupones(tienda_id, codigo, descuento_*, fechas, uso_maximo, activo)

usuarios / carrito / favoritos / valoraciones   ← legacy, deny-all (ver §6)
```

**Notas:**

- `productos.marca_id → marcas` y `productos.categoria_id → categorias` con
  `ON DELETE SET NULL` → borrar una marca no revienta con un error crudo de FK.
- **Soft delete** con columna `eliminado_en` + índices: `eliminarProducto()` la
  marca, `restaurarProducto()` la limpia; el público nunca las ve.
- Índices por `tienda_id`, `estado`, `slug`, más
  `migrations/20261030120000_multitienda_indices.sql`.
- **Las tablas `carrito` y `favoritos` están en desuso**: el carrito vive en
  `localStorage` (explicar esto evita la pregunta *"¿para qué está `carrito`?"*).

---

## 6. Seguridad

Es el bloque más sólido del proyecto y el que más peso tiene en una defensa.

### 6.1 Row Level Security (el tema estrella)

**Regla del proyecto: toda tabla nueva nace con RLS, y sus policies usan
`auth.uid()`. Nunca se confía en el filtrado del cliente.**

Capa 1 — **filas visibles** (`USING`):

```sql
CREATE POLICY productos_select_public ON public.productos
  FOR SELECT TO anon USING (estado = true);   -- solo publicados
```

Capa 2 — **columnas visibles** (`GRANT` por columna):

```sql
REVOKE SELECT ON public.productos FROM anon;
GRANT SELECT (
  id, nombre, descripcion, precio, precio_descuento, stock, imagen_url,
  slug, estado, es_nuevo, es_destacado, colores, referencia,
  categoria_id, marca_id
) ON public.productos TO anon;
-- Pedir una columna interna (tienda_id, imagen_key) como anon → 42501
```

Capa 3 — **escritura solo del dueño**:

```sql
CREATE POLICY tiendas_owner_write ON public.tiendas
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM tiendas t
                 WHERE t.id = tiendas.id AND t.usuario_id = (SELECT auth.uid())))
  WITH CHECK (...);
```

| Grupo de tablas | Política |
|---|---|
| `categorias`, `marcas`, `productos` | Pública: solo filas publicadas + proyección de columnas |
| `tiendas` | Pública: solo fila `activa = true` y 10 columnas (sin `usuario_id`, `plan_actual`…) |
| `pedidos`, `cupones`, `detalles_pedido` | Owner-only (`authenticated`) |
| `usuarios`, `carrito`, `favoritos`, `valoraciones` | **Deny-all** (RLS sin policies) |
| Owner policies | Solo `TO authenticated` (nunca `TO public`) |

**Detalle de rendimiento:** `(SELECT auth.uid())` va **envuelto en subquery**
para evaluarse una vez por consulta y no una vez por fila (recomendación del
performance advisor de InsForge).

**Dos clientes, dos mundos:**

| Cliente | Quién lo usa | RLS |
|---|---|---|
| **Anónimo** (`anon` key) | Store | Ve solo lo público y las columnas públicas |
| **De sesión** (`createServerClient({cookies})`) | Dashboard, login | Ve lo del dueño vía `auth.uid()` |

> La **API key / `service_role` nunca** va al cliente; las 3 apps usan la `anon`.

### 6.2 Cabeceras y CSP

Las 3 apps definen `poweredByHeader: false` y headers comunes:
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
(cam/mic/geolocalización desactivadas), `Cross-Origin-Opener-Policy: same-origin`
y `Strict-Transport-Security` **solo en producción**.

| App | Estrategia CSP | Motivo |
|---|---|---|
| Store | **Estática** en `next.config.ts`, `script-src 'self' 'unsafe-inline'` | Mantener el ISR (un nonce obligaría a render dinámico) |
| Login y Dashboard | **Con nonce** vía `proxy.ts`: `script-src 'self' 'nonce-…' 'strict-dynamic'` | Ya son dinámicos → eliminan `'unsafe-inline'` de verdad |

El nonce lo genera `proxy.ts` por request, lo expone en la cabecera `x-nonce` y
Next lo aplica a sus scripts; el único `<script>` inline propio (init del tema)
lee el nonce con `headers()`.

**`'unsafe-eval'` solo existe en desarrollo** (React lo usa para debugging) y
desaparece en producción — verificado con `curl -sI` sobre `next start`.

### 6.3 Riesgo aceptado y documentado (zona honesta)

La store permite `script-src 'unsafe-inline'`. En vez de ocultarlo, está
**justificado con controles compensatorios**:

- React escapa automáticamente todo el contenido renderizado.
- El único `dangerouslySetInnerHTML` del JSON-LD sanitiza: `.replace(/</g, "\\u003c")`.
- `TEMA_INIT_SCRIPT` es una constante hardcodeada, sin entrada de usuario.
- `connect-src` restringido a `'self'` + InsForge → no hay exfiltración.
- `esUrlPieValida()` rechaza `javascript:` y `data:` en los enlaces del pie.

### 6.4 Auditorías

- **OWASP ZAP 2.16.0** (spider + pasivo + activo) sobre las 3 apps en
  producción: **sin hallazgos High/Critical**. Detalles en `SECURITY-REPORT.md`.
- **`npm audit`:** `next` 16.3.3 → 16.4.2, `sharp` → 0.35.5,
  `brace-expansion` parcheados. Riesgo aceptado documentado: `braces` (cadena
  solo-dev, sin versión parcheada). **Regla: nunca `npm audit fix --force`.**
- **Cookies:** refresh token `HttpOnly` (el sensible); access token legible por
  JS por decisión del SDK (vida corta). `Secure` solo en producción → servir
  siempre por HTTPS en prod.

---

## 7. Testing y calidad

### Pirámide de tests

```
        ┌──────────────────────────────┐
        │  Playwright E2E (39 tests)   │  tests/e2e/*.spec.ts — 9 specs
        ├──────────────────────────────┤
        │  Integración (Vitest)        │  apps/*/tests/integration/
        ├──────────────────────────────┤
        │  Unitarios (Vitest, jsdom)   │  junto al componente: *.test.tsx
        └──────────────────────────────┘
        57 archivos de test en total
```

**E2E (`npm run test:e2e`):** `playwright.config.ts` levanta las **3 apps** como
`webServer` y corre contra `http://127.0.0.1:3000`.

| Spec | Cubre |
|---|---|
| `store-navigation` | Nav móvil/escritorio, 404 amigable |
| `product-detail` (6) | Galería, selector talla/color, CTA, agregar al carrito |
| `search-flow` (4) | Abrir/cerrar, resultados, Escape, sin resultados |
| `cart-full-flow` (5) | Agregar, cantidades, subtotal ≥/< $200.000 |
| `cart-empty-state` (4) | Estado vacío, CTAs, sin resumen ni WhatsApp |
| `theme-toggle` (3) | Clase `dark` y persistencia al recargar |
| `offline-detection` (3) | Banner online/offline |
| `dashboard-session` | Sin sesión → cada sección redirige al login |
| `dashboard-crud-store` (6) | **Flujo completo producto→tienda**, diseño→tienda, marcas, categorías, WhatsApp, toggle de precios |

**Unitarios:** config por paquete (`vitest.config.ts`, `environment: jsdom`,
`setupFiles: ./test.setup.ts`). Notable: `packages/db` testea
`formatAuthError` (que los mensajes de error de auth sean los esperados) y
`combinarDiseno` (el merge del JSONB).

**Comandos:** `npm run dev` · `build` · `lint` · `typecheck` · `test` ·
`test:e2e` (todos vía `turbo`).

---

## 8. Proceso de desarrollo (OpenSpec)

El repo usa un flujo **spec-driven** (`openspec/config.yaml`):

```
openspec/
├── specs/                  ← especificaciones VIVAS (GIVEN/WHEN/THEN)
│   ├── store/    productos, price-filter, responsive, product-card-loading
│   ├── dashboard/ productos, pedidos, marcas-categorias, diseno, responsive
│   └── infra/    database, theme
├── changes/                ← cambio en progreso
│   └── <slug>/
│       ├── proposal.md     ← Why / What / Non-goals / Impact (<500 palabras)
│       ├── design.md       ← contexto, goals, decisiones
│       ├── tasks.md        ← chunks ≤ 2 h con checkbox
│       └── specs/.../spec.md  ← delta sobre la spec viva
└── changes/archive/2026-10-13-redesign-price-filter/   ← cerrados con fecha
```

**Por qué importa:** el cambio nunca empieza por el código. Primero la
propuesta, luego el diseño, luego tareas verificables (`typecheck` antes de
commitear), y al cerrar se sincroniza el delta a la spec viva.

---

## 9. Temario: qué estudiar para entender el proyecto

Ordenado por niveles. Un lector debería poder marcarse cada punto.

### Nivel 1 — Fundamentos

| # | Tema | Qué hay que entender | Dónde se ve en el repo |
|---|---|---|---|
| 1 | **Next.js App Router** | `page/layout/loading/error`, server vs client components, `searchParams`, `redirect()`/`notFound()` | `apps/*/app/**` |
| 2 | **ISR vs render dinámico** | `revalidate`, `force-dynamic`, `unstable_cache` + tags, cuándo conviene cada uno | `apps/store/app/**/page.tsx` |
| 3 | **`<Suspense>` y streaming** | fallback por sección, skeletons, no bloquear el render | `apps/store/app/page.tsx` |
| 4 | **React moderno** | server actions (`'use server'`), `useSyncExternalStore`, context, hidratación y *mismatch* | `CartContext.tsx`, `actions/*.ts` |
| 5 | **TypeScript** | tipos compartidos, `satisfies`, interfaces de dominio | `packages/db/src/diseno.ts` |

### Nivel 2 — Datos y backend

| # | Tema | Qué hay que entender | Dónde se ve en el repo |
|---|---|---|---|
| 6 | **Postgres: RLS** ⭐ | `USING`/`WITH CHECK`, `auth.uid()`, roles `anon` vs `authenticated`, `GRANT` por columna, por qué el filtrado del cliente no es seguridad | `migrations/*.sql` |
| 7 | **Patrón BaaS** | cliente anónimo vs de sesión, JWT, refresh token, Storage (guardar `url` **y** `key`) | `packages/db/src/{client,server,refresh}.ts` |
| 8 | **Autenticación** | flujo login/registro/OTP/OAuth PKCE, cookies `HttpOnly`, `force-dynamic` por sesión | `apps/login`, `packages/db/src/actions.ts` |
| 9 | **Caché multi-app** | por qué dos apps no comparten caché y cómo se invalida por HTTP con secreto | `actions/diseno.ts`, `app/api/revalidate/route.ts` |
| 10 | **Errores y resiliencia** | retry con backoff, *fail-soft* (`safeQuery`), no tirar la página por una query | `lib/fetch-utils.ts` |

### Nivel 3 — Arquitectura

| # | Tema | Qué hay que entender | Dónde se ve en el repo |
|---|---|---|---|
| 11 | **Monorepo + Turborepo** | workspaces, grafo de tareas (`dependsOn: ^build`), caché de builds, filtrado por paquete | `turbo.json`, `package.json` raíz |
| 12 | **Multi-tenancy** ⭐ | subdominios, middleware `rewrite` vs `redirect`, headers + cookie, aislamiento por `tienda_id` | `apps/store/proxy.ts`, `lib/tenant.ts` |
| 13 | **Estado sin librerías** | store externo manual con `useSyncExternalStore`, snapshots estables | `CartContext.tsx` |
| 14 | **Diseño por configuración** | JSONB como fuente de verdad, merge con defaults, render a variables CSS | `packages/db/src/diseno.ts` |
| 15 | **Seguridad por app** | por qué 3 apps separadas, CSP con nonce vs estática | `next.config.ts`, `packages/db/src/proxy.ts` |

### Nivel 4 — Ingeniería de producto

| # | Tema | Qué hay que entender | Dónde se ve en el repo |
|---|---|---|---|
| 16 | **Seguridad web** ⭐ | OWASP Top 10, CSP, nonce, clickjacking, riesgo aceptado vs riesgo ignorado | `README.md` (§ Seguridad), `SECURITY-REPORT.md` |
| 17 | **Testing** | pirámide, E2E con `webServer` múltiple, tests de integración sin red | `tests/e2e/`, `vitest.config.ts` |
| 18 | **Accesibilidad** | `role="status"`, `aria-busy`, `aria-disabled`, `aria-current`, focus ring | `loading.tsx`, `Pagination.tsx` |
| 19 | **Diseño UI** | tokens CSS (nunca hex sueltos), dark mode sin flash, breakpoints canónicos 480/768/1024 | `globals.css`, `app/layout.tsx` |
| 20 | **Spec-driven dev** | especificar antes de codificar, deltas, archivar cambios | `openspec/` |

### Orden de estudio recomendado (si alguien tiene una semana)

```
Día 1-2  →  Temas 1-5   (leer las páginas de la store y seguir el flujo)
Día 3    →  Temas 6-7   (las migraciones de RLS, línea por línea) ⭐ el núcleo
Día 4    →  Temas 11-12 (monorepo + multi-tenancy: proxy.ts y tenant.ts)
Día 5    →  Temas 8-10  (auth, caché, resiliencia)
Día 6    →  Temas 16-17 (seguridad y tests: correr un E2E en vivo)
Día 7    →  Temas 13-20 (los detalles: carrito, diseño, a11y, OpenSpec)
```

---

## 10. Guion de presentación (45 min)

### 0-3 min · El hook
> "Esto es un Shopify para tiendas de barrio: el dueño configura su catálogo y
> su diseño desde un panel, y su tienda se comparte por WhatsApp. Soporta
> varias tiendas con una sola base de datos."

**Demo rápida en vivo:** store pública → login → dashboard → cambiar el color
principal → volver a la store y ver el cambio.

### 3-8 min · Qué hay en la caja
- El diagrama de la §2 (3 apps + 2 paquetes + InsForge).
- El *repo map*: dónde está cada cosa (§ tabla de apps/paquetes).
- Comandos: `npm install` · `npm run dev` (levanta las 3) · `npm run test:e2e`.

### 8-18 min · Un flujo completo (el hilo conductor)
Usar el recorrido de la **§4** (crear un producto). Es la mejor forma de
mostrar todas las capas sin hablar de teoría suelta:
**auth → RLS → server action → storage → revalidación de caché → aparece en la store.**

### 18-28 min · Los dos temas estrella

**A) Multi-tenancy (5 min)** — §3.1
- Mostrar `proxy.ts`: 25 líneas que resuelven todo.
- El *trío* rewrite → header → cookie → query.
- Enfatizar: *"el aislamiento está en la base de datos, no en el framework."*

**B) Seguridad / RLS (5 min)** — §6.1
- Mostrar `migrations/20261018233928_restringir-lectura-anon-catalogo.sql`.
- Las 3 capas: fila → columna → owner.
- El *"antes y después"*: el advisor detectó `USING (true)` y se corrigió.

### 28-35 min · Decisiones de ingeniería (elige 3-4)

| Decisión | La frase que la vende |
|---|---|
| Carrito con `useSyncExternalStore` propio | *"Cero dependencias y cero coste de servidor para un carrito que casi nadie guarda en su cuenta."* |
| Invalidación cross-app por HTTP | *"Dos apps no comparten caché de Next; lo resolvemos con un endpoint y un secreto."* |
| CSP: nonce vs estática | *"Sabemos que la store tiene `unsafe-inline`; está documentado, es un riesgo aceptado con 7 controles compensatorios, y sabemos exactamente por qué."* |
| Soft delete | *"Borrar es marcar: el dueño puede deshacer y el público nunca lo ve."* |
| Spec-driven (OpenSpec) | *"El cambio no empieza en el código: empieza en una propuesta."* |

### 35-42 min · Calidad
- Correr un E2E en vivo (`npm run test:e2e`) o mostrar el reporte de ZAP.
- Cifras: 39 E2E, 57 archivos de test, sin hallazgos High/Critical.

### 42-45 min · Roadmap y cierre
- Subdominios reales (`mitienda.tudominio.com`) — ver §12.
- Cerrar con la visión y abrir a preguntas.

---

## 11. Preguntas frecuentes en una defensa

**¿Por qué 3 apps y no una sola?**
Aislamiento de seguridad y de rendimiento. La store es anónima y con ISR; el
dashboard lleva sesión y CSP con nonce (que exige render dinámico). Juntarlas
obligaría a elegir un solo modelo de render y a exponer el panel en el mismo
origen que la web pública.

**¿Por qué el carrito no está en la base de datos?**
Es una decisión de alcance: el checkout termina en WhatsApp, no en un pago. Un
carrito persistido requeriría sesión para el visitante (fricción) y tablas +
RLS + limpieza. `localStorage` da la misma UX con cero coste. Las tablas
`carrito`/`favoritos` quedaron legacy y con deny-all.

**¿No es inseguro que la store tenga `script-src 'unsafe-inline'`?**
Es un riesgo **aceptado y documentado**, no ignorado: un nonce rompería el ISR.
Se mitiga con el escaping de React, JSON-LD sanitizado, `connect-src` restringido
y `esUrlPieValida`. El dashboard y login **sí** usan nonce y no reportan la
alerta. Verificado con ZAP.

**¿Qué pasa si dos tiendas usan el mismo slug?**
Los slugs de categoría son únicos **por tienda**; el generador
`generarSlugUnico()` evita colisiones. Y todo va filtrado por `tienda_id`.

**¿Escalability?**
El cuello de botella actual es el ISR + los `revalidateTag` cross-app. Con
tráfico real, el siguiente paso sería CDN con tags o mover la invalidación a un
webhook/realtime de InsForge.

**¿Por qué no hay pagos?**
Alcance del producto: es un catálogo con pedido por WhatsApp. El esquema ya
tiene `pedidos`, `detalles_pedido` y `cupones` preparados para eso.

**¿Cómo evitas que un cliente lea datos de otra tienda?**
Dos capas: (1) toda query filtra por `tienda_id` resuelto desde el middleware,
y (2) RLS verifica en Postgres. Si alguna query se olvidara del filtro, RLS
sigue siendo la última línea — pero ambas están.

---

## 12. Roadmap y deudas conocidas

**Pendiente declarado en el README:**
- [ ] **Comprar el dominio de producción** y montar el enrutamiento multi-tienda
      por subdominio real. Hoy `/s/:subdominio` es un rewrite interno; el
      dashboard y el login irán en dominios separados.

**Deudas y decisiones documentadas (no son sorpresas):**
- `braces` ≤ 3.0.3: riesgo aceptado, cadena solo-dev sin versión parcheada.
  Regla: **nunca** `npm audit fix --force`.
- CSP con `unsafe-inline` en la store: riesgo aceptado (§6.3).
- La 307 con cuerpo HTML largo en dev: solo en desarrollo, no filtra secretos.
- `apps/store/app/actions/products-original.ts`: código legado sin uso aparente.
- `next-themes` está en `package.json` pero **no se usa**: el provider de tema
  es propio (`ThemeProvider.tsx`).
- El README menciona "Nav, Footer" en `@makced/ui`, pero viven en
  `apps/store/components/layout/`.

---

## Anexo — Comandos útiles

```bash
npm install                # instalar todo el monorepo
npm run dev                # levanta store :3000, login :3001, dashboard :3002
npm run build              # build de todas las apps (turbo)
npm run lint               # lint
npm run typecheck          # typecheck
npm run test               # tests unitarios (Vitest) de todos los paquetes
npx playwright install chromium   # una sola vez
npm run test:e2e           # 39 tests E2E (levanta las 3 apps)

npx turbo build --filter=@makced/store      # build de una sola app
```

**Archivos clave para recorrer en una demostración:**

| Para mostrar | Archivo |
|---|---|
| Multi-tenancy | `apps/store/proxy.ts` (25 líneas) |
| Resolución de tienda | `apps/store/lib/tenant.ts` |
| RLS por columna | `migrations/20261018233928_restringir-lectura-anon-catalogo.sql` |
| Gate de escritura | `apps/dashboard/actions/tienda.ts` → `requireAuth()` |
| Carrito sin librerías | `apps/store/components/auth/CartContext.tsx` |
| Modelo de diseño | `packages/db/src/diseno.ts` |
| Seguridad completa | `README.md` (§ Seguridad) y `SECURITY-REPORT.md` |
| Specs y proceso | `openspec/specs/`, `openspec/changes/` |
