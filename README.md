# Makced

Monorepo de la plataforma Makced con **Turborepo + npm workspaces**. Consta de tres aplicaciones Next.js y paquetes compartidos, con [InsForge](https://insforge.dev) como backend (Postgres, Auth, Storage, Functions).

## Aplicaciones

| App | Paquete | Puerto | Descripción |
|-----|---------|--------|-------------|
| Tienda | `@makced/store` | 3000 | Tienda pública de calzado y ropa deportiva |
| Login | `@makced/login` | 3001 | Autenticación (login / registro) |
| Dashboard | `@makced/dashboard` | 3002 | Panel de administración (protegido) |

## Paquetes compartidos

| Paquete | Descripción |
|---------|-------------|
| `@makced/db` | Cliente de conexión a InsForge (client, actions, proxy, refresh, server) |
| `@makced/ui` | Componentes UI compartidos (Nav, Footer, LoginForm) |

## Requisitos

- Node.js 22+
- npm 10+
- Un proyecto InsForge (este repositorio usa el proyecto **Makced-Store**)

## Instalación

```bash
npm install
```

## Configuración de variables de entorno

Copia las credenciales de InsForge en el archivo `.env.local` de **cada** aplicación:

```
# apps/store/.env.local, apps/login/.env.local, apps/dashboard/.env.local
NEXT_PUBLIC_INSFORGE_URL=https://253fnuce.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=anon_xxx...   # copia la anon key desde el proyecto InsForge (ver .env.example)
```

> ⚠️ Nunca subas los `.env.local` al repositorio (están en `.gitignore`).

## Ejecución en desarrollo

Corre las tres aplicaciones a la vez con Turborepo:

```bash
npm run dev
```

- Tienda: http://localhost:3000
- Login: http://localhost:3001
- Dashboard: http://localhost:3002

## Build / Lint / Typecheck

```bash
npm run build        # build de todas las apps
npm run lint         # lint de todas las apps
npm run typecheck    # typecheck de todas las apps
npm run test         # tests unitarios (Vitest) de todos los paquetes
```

## 🚀 Arquitectura de despliegue e infraestructura

El ecosistema de **`makced.online`** se despliega como **micro-frontends desacoplados en Vercel**: cada aplicación del monorepo es un proyecto independiente sobre el mismo repositorio, separando la capa institucional de la aplicación transaccional.

### 🌐 Distribución de dominios y proyectos

| Host | Proyecto Vercel | Root Directory | Build | Propósito |
|------|-----------------|----------------|-------|-----------|
| `makced.online` | Landing (repositorio aparte) | — | — | Marketing y acceso general a la plataforma |
| `store.makced.online` | `makced-store` | `apps/store` | `npx turbo build --filter=@makced/store` | Tienda pública multi-tienda |
| `login.makced.online` | `makced-login` | `apps/login` | `npx turbo build --filter=@makced/login` | Autenticación (login / registro) |
| `dashboard.makced.online` | `makced-dashboard` | `apps/dashboard` | `npx turbo build --filter=@makced/dashboard` | Panel de administración (protegido) |

Cada proyecto apunta su **Root Directory** a su app; Vercel resuelve los workspaces de npm desde la raíz del monorepo.

> **El multi-tenancy es path-based.** Las tiendas viven bajo
> `store.makced.online/s/:subdominio`, así que **un solo host y un solo
> certificado** cubren todas las tiendas. Los subdominios reales
> (`mitienda.makced.online`) son una fase posterior: exigirán DNS comodín,
> certificado wildcard y decidir el dominio de las cookies (`tienda-subdominio`).

### ⚙️ Configuración de red y DNS

- **Proveedor de dominio:** Namecheap, delegando los DNS a Vercel
  (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`).
- **Registros:** cada subdominio se añade en *Settings → Domains* y se apunta
  al valor que Vercel indique (CNAME a `cname.vercel-dns.com`).
- **`@` (apex):** BasicDNS de Namecheap **no admite CNAME ni ALIAS** en la raíz;
  por eso se delegan los nameservers a Vercel en lugar de crear registros a mano.
- **Regla:** nunca copiar IPs/CNAME de un tutorial — usar siempre el valor que
  muestra Vercel en «Invalid Configuration».
- **Seguridad:** SSL automático (Let's Encrypt) gestionado por Vercel para el
  dominio raíz y cada subdominio. Las cookies de sesión activan `Secure` solo
  en producción, por lo que **el sitio debe servirse siempre por HTTPS**.

### 🔑 Variables de entorno en producción

| Variable | store | login | dashboard |
|----------|:-----:|:-----:|:---------:|
| `NEXT_PUBLIC_INSFORGE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_TIENDA_URL` (`https://store.makced.online`) | ✅ | — | ✅ |
| `NEXT_PUBLIC_LOGIN_URL` (`https://login.makced.online`) | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_DASHBOARD_URL` (`https://dashboard.makced.online`) | — | ✅ | ✅ |
| `REVALIDATE_SECRET` (mismo valor en store y dashboard) | ✅ | — | ✅ |

- `NEXT_PUBLIC_*` se **inlinea en el bundle en tiempo de build**: cambiarla
  exige **redesplegar**, no basta con guardarla.
- `REVALIDATE_SECRET` **nunca** lleva el prefijo `NEXT_PUBLIC_` (sería pública y
  permitiría purgar la caché de la tienda desde el navegador). Es el secreto que
  permite al dashboard invalidar los `unstable_cache` de la store vía
  `POST /api/revalidate`.
- En InsForge, `insforge.toml` → `allowed_redirect_urls` debe incluir
  `https://login.makced.online/**` y `https://store.makced.online/**`.

## Tareas pendientes

- [x] **Comprar el dominio `makced.online`.** ✅ Comprado (Namecheap).
- [ ] **Configurar DNS + los 4 proyectos en Vercel** (ver *Arquitectura de
      despliegue* más arriba) y añadir los `allowed_redirect_urls` en InsForge.
- [ ] **Multi-tenancy con subdominios reales** (`mitienda.makced.online`):
      DNS comodín, certificado wildcard, `domain` en la cookie
      `tienda-subdominio` y cambio de `/s/:subdominio` por host. La versión
      actual path-based está terminada y documentada abajo.

## Estados de carga (skeletons)

Convención única para mostrar siluetas mientras el servidor resuelve datos.
Ambas variantes heredan el modo oscuro y respetan `prefers-reduced-motion`:

| App | Skeleton | Dónde |
|-----|----------|-------|
| Store | `skeleton` de daisyUI + utilidades (`skeleton h-32 w-full`) | `components/product/ProductCard.tsx` (prop `loading`), `ProductGridSkeleton.tsx`, `components/ui/{Categoria,Marcas,ProductoDetalle}Skeleton.tsx`, activados desde `app/**/loading.tsx` |
| Dashboard | `.db-skeleton` (tokens `--db-*`, sin daisyUI) | `components/skeleton/TablaSkeleton.tsx`, `components/skeleton/ResumenSkeleton.tsx`, activados desde `app/**/loading.tsx` |

Reglas:

- **Store → daisyUI; dashboard → `.db-skeleton`** (`app/db-base.css`). No mezclar: el panel no usa clases de utilidad.
- Todo estado de carga lleva `role="status"` + `aria-busy="true"` y un texto oculto (`.db-sr-only` / `sr-only`).
- Las páginas del dashboard son server components con `await`: el punto de activación es su archivo `app/<ruta>/loading.tsx`, no `useState`.
- En el store, cada sección del home (marcas, categorías, destacados) hace fetch **dentro** de su propio componente servidor con `<Suspense>` + skeleton, para no bloquear el render completo.
- Nota: con ISR (páginas `○` estáticas) el HTML ya viene listo, así que el skeleton solo se ve en la primera compilación/visita en frío o en rutas dinámicas (`ƒ`). No es un bug, es intencionado (rendimiento).

## Convenciones de estilo (store y dashboard)

- **Breakpoints canónicos:** `480px` (móvil) · `768px` (tablet) · `1024px` (escritorio). No usar otros valores: los `640px` heredados se unificaron a `480px`.
- **Escala tipográfica (store):** tokens `--fs-xs … --fs-3xl` + `--fs-display` en `apps/store/app/globals.css`, todos en `rem`. Texto de lectura mínimo `--fs-xs` (12px); solo los badges numéricos pueden ir a 11px.
- **Tokens semánticos de color:** `--bg-media`, `--bg-strong`/`--on-strong`, `--text-muted`, `--text-danger`, `--focus-ring`. Regla: en componentes, nunca hex sueltos — siempre tokens (el dark mode y el theming dependen de ello).

## Pruebas end-to-end

Playwright prueba recorridos reales de la tienda en Chromium. Instala el navegador
una sola vez y ejecuta las pruebas desde la raíz del monorepo:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright inicia la tienda en `http://127.0.0.1:3000` si no hay ya un servidor
disponible. Las pruebas están en `tests/e2e/`.

También puedes filtrar por aplicación:

```bash
npx turbo build --filter=@makced/store
```

## Seguridad

### Cabeceras HTTP de seguridad

Las tres apps definen `poweredByHeader: false` y un bloque `headers()` en `apps/*/next.config.ts` con los headers estáticos comunes:

| Cabecera | Valor | Propósito |
|----------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Evita el sniffing de MIME |
| `X-Frame-Options` | `DENY` | Bloquea clickjacking (no embebible en iframes) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita la fuga de referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Desactiva APIs sensibles |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aísla la ventana/opener |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Solo en producción (`NODE_ENV=production`) |

El `Content-Security-Policy` se aplica en **enforce**, con dos estrategias según la app:

| App | Estrategia CSP | Motivo |
|-----|----------------|--------|
| Store (:3000) | **Estática** (`next.config.ts`), `script-src 'self' 'unsafe-inline'` | Mantiene el ISR/rendimiento (un nonce obligaría a render dinámico en cada petición) |
| Login (:3001) y Dashboard (:3002) | **Con nonce** (`proxy.ts`), `script-src 'self' 'nonce-…' 'strict-dynamic'` | Ya son dinámicos → mitigan XSS de verdad al eliminar `'unsafe-inline'` del `script-src` |

Política base (la variante nonce la genera `proxy.ts` de `@makced/db` por petición):

```
default-src 'self';
script-src 'self' [ 'unsafe-inline' | 'nonce-<v>' 'strict-dynamic' ] [+ 'unsafe-eval' solo en dev];
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https://upload.wikimedia.org https://253fnuce.us-east.insforge.app https://cdn.insforge.dev https://insforge-storage.s3.us-east-2.amazonaws.com https://worldvectorlogo.com https://images.unsplash.com;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://253fnuce.us-east.insforge.app https://cdn.insforge.dev https://insforge-storage.s3.us-east-2.amazonaws.com;
frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';
[+ 'upgrade-insecure-requests' solo en prod]
```

- El nonce lo genera `proxy.ts` por petición, lo expone en la cabecera `x-nonce` y Next lo aplica automáticamente a sus scripts. El único `<script>` inline propio (init de tema del dashboard) lee el nonce con `headers()`.
- `'unsafe-eval'` solo en desarrollo (React lo usa para debugging); `'upgrade-insecure-requests'` solo en producción (rompería el `http://` local).
- `style-src` conserva `'unsafe-inline'` (bajo riesgo, evita romper estilos inline de React); las fuentes de Google del editor de diseño se permiten explícitamente en `style-src`/`font-src`, y el storage de InsForge (`cdn.insforge.dev`, `insforge-storage.s3.us-east-2.amazonaws.com`) y los logos (`worldvectorlogo.com`) y `images.unsplash.com` en `img-src`.
- El framing queda **bloqueado de verdad** por `X-Frame-Options: DENY`.
- `X-Powered-By` se eliminó con `poweredByHeader: false`.
- El nonce exige **render dinámico**: por eso solo se usa en login (ya `force-dynamic`) y dashboard (dinámico por sesión), nunca en la store (ISR).

### Hallazgo ZAP: `script-src 'unsafe-inline'` en la store (riesgo aceptado)

ZAP reporta "Medium" porque la cabecera CSP de la store permite `'unsafe-inline'` en `script-src`. Es una **decisión deliberada** para mantener el ISR (HTML estático pre-renderizado). El `'unsafe-eval'` que ZAP también podía marcar **solo existe en desarrollo** (`NODE_ENV=development`) y desaparece en producción (verificado con `curl -sI` sobre `next start`).

**Controles compensatorios que mitigan el XSS residual:**

- React escapa automáticamente todo el contenido renderizado (nombres, descripciones, títulos de productos/marcas/categorías).
- El único `dangerouslySetInnerHTML` de la store (`apps/store/app/verProducto/page.tsx`) es un JSON-LD serializado con `.replace(/</g, "\\u003c")` (sanitización del `<`).
- El otro `dangerouslySetInnerHTML` (`apps/store/app/layout.tsx`) inyecta `TEMA_INIT_SCRIPT`, una constante estática hardcodeada sin entrada de usuario.
- `connect-src` restringido a `'self'` + dominio InsForge → impide exfiltración de datos a dominios externos.
- `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `object-src 'none'` siguen en fuerza.
- Las URLs del pie se validan con `esUrlPieValida` (`packages/db/src/diseno.ts`), que rechaza esquemas peligrosos (`javascript:`, `data:`, etc.) y solo permite rutas internas, `http(s)`, `mailto` y `tel`.
- Los dashboard y login **no** tienen este problema: usan CSP con nonce (`proxy.ts` → `script-src 'self' 'nonce-…' 'strict-dynamic'`).

**Verificación empírica (ZAP 2.16.0, producción `next start`):** la alerta "CSP: script-src unsafe-eval" **no aparece** en ningún endpoint de la store; solo quedan "CSP: script-src unsafe-inline" y "CSP: style-src unsafe-inline" (riesgos aceptados, documentados arriba). Login y dashboard no reportan "script-src unsafe-inline" (nonce operativo).

### Seguridad de la base de datos (RLS)

Las tablas del catálogo (`categorias`, `marcas`, `productos`) ya usan RLS (`auth.users`). Una auditoría de InsForge detectó **7 tablas sin RLS** expuestas a `anon` (advisor `rls-disabled`), demostrado con `GET /api/database/records/usuarios` → `200` + `password_hash`. Se corrigió en `migrations/20261015225629_proteger-tablas-sin-rls.sql`:

| Grupo | Tablas | Política |
|-------|--------|----------|
| Legacy/vacías | `usuarios`, `carrito`, `favoritos`, `valoraciones` | **Deny-all**: RLS activo **sin policies** → `anon`/`authenticated` no leen ni escriben (la API admin con API key no se ve afectada) |
| Datos de tienda | `pedidos`, `cupones`, `detalles_pedido` | **Owner-only** (`FOR ALL` con `USING` + `WITH CHECK`): solo el dueño (`tiendas.usuario_id = auth.uid()`). `detalles_pedido` valida vía `pedidos → tiendas`. Sin lectura anónima |
| Integridad del catálogo | `productos.categoria_id`, `productos.marca_id` | FKs con `ON DELETE SET NULL` (borrar una categoría/marca no rompe con un error crudo de FK) |

- `(SELECT auth.uid())` va envuelto en subquery para que se evalúe **una vez** y no por fila (rendimiento).
- **Lectura pública de `tiendas`** (advisor `rls-permissive`, corregido en `migrations/20261018213343_restringir-tiendas-select-anon.sql`): la tienda pública sí necesita la fila de la tienda activa (color, logo, diseño, WhatsApp), pero la policy anterior era `FOR SELECT USING (true) TO public` → cualquier `anon` leía la fila **completa**, incluidas columnas privadas (`usuario_id`, `propietario`, `plan_actual`, `created_at`, `updated_at`). Ahora `anon`: (1) solo ve la fila `activa = true`; (2) solo puede `SELECT` un subconjunto — `id, nombre_tienda, subdominio, plantilla_id, color_principal, logo_url, descripcion, activa, diseno, whatsapp_numero`. Pedir una columna privada como `anon` devuelve `42501 permission denied`.
- El dashboard lee la fila completa (incluidas columnas privadas) con el **cliente de sesión** (`getTienda()` → `createServerClient({ cookies })`, RLS `tiendas_owner_write`), **nunca** con `anon`.
- **Lectura pública del catálogo** (`marcas`, `productos`, `categorias`; advisor `rls-permissive`, corregido en `migrations/20261018233928_restringir-lectura-anon-catalogo.sql`): las policies eran `FOR SELECT USING (true) TO public` → `anon` leía todas las filas y columnas, incluidas las internas (`logo_key`/`imagen_key`, `tienda_id`, `created_at`, `updated_at`). Ahora `anon`: (1) solo ve los registros publicados (`activa = true` en `marcas`/`categorias`, `estado = true` en `productos`); (2) solo puede `SELECT` la proyección pública — `marcas(id, nombre, logo_url, imagen_url, activa)`, `categorias(id, nombre, slug, imagen_url, activa)`, `productos(id, nombre, descripcion, precio, precio_descuento, stock, imagen_url, slug, estado, es_nuevo, es_destacado, colores, referencia, categoria_id, marca_id)`. Pedir una columna interna como `anon` devuelve `42501 permission denied`.
- El dashboard lee el catálogo completo (incluidas `logo_key`/`imagen_key`) con el **cliente de sesión** (`listarMarcas`, `listarCategorias`, `getProductosPaginado`, `getProductosCount`, `getResumenStats`, `getCategorias`/`getMarcas`, `generarSlugUnico`), **nunca** con `anon`.
- **Las policies de owner aplican solo a `authenticated`** (`migrations/20261018234320_owner-policies-solo-authenticated.sql`): eran `FOR ALL TO public` y su subconsulta lee `tiendas.usuario_id`; tras revocar esa columna a `anon`, cualquier lectura anónima fallaba con `permission denied for table tiendas` cuando una fila no cumplía la policy pública. Ahora `anon` solo evalúa las `<tabla>_select_public`. Además `auth.uid()` va en subquery `(SELECT auth.uid())` para evaluarse una vez por consulta (`migrations/20261018234742_owner-write-auth-uid-subquery.sql`).
- Regla: **toda tabla nueva nace con RLS** y sus policies usan `auth.uid()`; nunca confiar en el filtrado del cliente.
- Las 3 apps usan la clave **`anon`** (en `.env.local`); la **API key / `service_role` nunca** debe ir al cliente.

### Auditoría de dependencias (`npm audit`)

| Paquete | Antes | Después | Motivo |
|---------|-------|---------|--------|
| `next` | 16.3.3 | **16.4.2** | Crítica: cache poisoning SSG/ISR (self-hosted), SSRF en Image Optimization, RCE en `next/og`, info disclosure en el dev server, etc. |
| `sharp` | 0.35.4 | **0.35.5** | CVE en la dependencia `librsvg` |
| `brace-expansion` | 1.1.18 / 5.0.9 | **1.1.21 / 5.0.12** | DoS por expansión cuadrática / recursión |

Pendiente (riesgo aceptado):

- **`braces` ≤ 3.0.3** — [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (severidad alta, DoS por recursión). Es **solo de desarrollo**: cadena `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`; las apps no lo ejecutan en runtime. No existe versión parcheada (3.0.3 es la última publicada) y `npm audit fix --force` degradaría `eslint-config-next` a `14.2.35` (breaking), por lo que **no debe usarse**.

Regla: **nunca** ejecutar `npm audit fix --force`. Cuando salga `braces` 3.0.4+, fijarlo con `"overrides": { "braces": "^3.0.4" }` en el `package.json` raíz.

### Cookies de sesión

Las gestiona `@insforge/sdk` a través de `packages/db/src/refresh.ts`. Flags observados con un login real:

| Cookie | HttpOnly | Secure | SameSite |
|--------|----------|--------|----------|
| `insforge_refresh_token` | **sí** ✓ | solo en prod | Lax |
| `insforge_access_token` | **no** | solo en prod | Lax |

- El **refresh token** (larga vida, el sensible) es `HttpOnly`: JavaScript no puede leerlo.
- El **access token** no es `HttpOnly` por decisión de diseño del SDK (el cliente de navegador necesita leerlo). Riesgo bajo: es de vida corta y el refresh sigue protegido.
- `Secure` se activa automáticamente en producción → **servir siempre por HTTPS en prod** para que sea efectivo.

### Falso positivo del escáner: «timestamp Unix en la respuesta»

Un escáner de seguridad reportó un número epoch (p. ej. `1549298916`) en la respuesta del servidor. **No es una vulnerabilidad.** Proviene de:

- Los claims `exp`/`iat` de los **JWT de InsForge** (el payload del JWT es base64, no cifrado, así que el escáner lo lee).
- La cabecera `Expires` de las cookies de sesión.

Ambas son metadatos de vigencia del token, **públicos por diseño** en cualquier JWT (InsForge, Supabase, Auth0, OAuth…). Verificado además que no hay ningún otro epoch en el HTML ni en las cabeceras (solo el `Date` HTTP estándar, en formato legible). Sin acción requerida.

### Solo-dev: redirección 307 con cuerpo HTML (fuga de rutas internas)

Un escáner reportó que el dashboard (`:3002/`) responde `307 Temporary Redirect` **con un cuerpo HTML largo** (≈38 KB) en lugar de vacío. Es **real, pero solo en desarrollo**:

- Sin sesión, `apps/dashboard/app/layout.tsx` ejecuta `redirect(LOGIN_URL)` → `307` con `Location: http://localhost:3001`.
- La App Router **sigue inyectando el shell de error** (`<html id="__next_error__">`) en el cuerpo y, en modo dev, ese shell incluye el **overlay de depuración**, que filtra rutas del disco (`/home/<usuario>/…/.next/dev/…`) y ~28 rutas de `node_modules`.
- Verificado que **no filtra secretos**: `process.env`, `password`, `token`, host de InsForge y `auth.uid` → **0 apariciones**.

En **producción** Next sirve el shell de error redactado (sin rutas ni devtools), así que el riesgo no existe. **Riesgo aceptado** (mitigarlo solo empeoraría la depuración). Regla: no exponer un servidor de desarrollo a Internet.

### Resumen de hallazgos del escáner de seguridad

| Hallazgo | Disposición | Detalle |
|----------|-------------|---------|
| Falta `X-Content-Type-Options: nosniff` | **Resuelto** | Implementada en las 3 apps; verificado en páginas, estáticos, 307 y 404. El hallazgo era previo a la corrección |
| Timestamp Unix en la respuesta | **Falso positivo** | Claims `exp`/`iat` del JWT + `Expires` de cookies (metadatos públicos) |
| Redirección 307 con cuerpo HTML | **Solo-dev / aceptado** | Overlay de error de Next en dev; no ocurre en producción |
| Tablas sin RLS expuestas a `anon` | **Resuelto** | `migrations/20261015225629_proteger-tablas-sin-rls.sql` (deny-all + owner-only) |
| Lectura anónima permisiva (catálogo) | **Resuelto** | `migrations/20261018233928_restringir-lectura-anon-catalogo.sql` + `20261018234320_owner-policies-solo-authenticated.sql` + `20261018234742_owner-write-auth-uid-subquery.sql` (proyección pública + owner solo `authenticated`) |
| `braces` DoS (GHSA-vfj7-8cjw-p6xm) | **Aceptado** | Cadena solo-dev sin parche; no usar `npm audit fix --force` |

## Estructura del monorepo

```
Makced/
├── apps/
│   ├── store/       # @makced/store  (tienda pública)
│   ├── login/       # @makced/login  (autenticación)
│   └── dashboard/   # @makced/dashboard  (panel administración)
├── packages/
│   ├── db/          # @makced/db     (cliente InsForge, auth, sesión)
│   └── ui/          # @makced/ui     (componentes compartidos)
├── package.json     # raíz: npm workspaces + Turborepo
├── turbo.json
└── .env.example
```

## Backend

InsForge **Makced-Store**:

- **API Base:** `https://253fnuce.us-east.insforge.app`
- **Dashboard:** https://insforge.dev/dashboard/project/32f1493f-b2c4-4039-bcfb-ca8a0639ca6b

### InsForge CLI

```bash
# Instalar
npm install -g @insforge/cli

# Login
insforge login --user-api-key uak_...

# Vincular proyecto (desde la raíz del monorepo)
insforge link --project-id 32f1493f-b2c4-4039-bcfb-ca8a0639ca6b
```

## Links

- Documentación InsForge: https://insforge.dev/docs
- SDK Reference: `node_modules/@insforge/sdk/SDK-REFERENCE.md`
