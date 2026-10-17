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
img-src 'self' data: blob: https://upload.wikimedia.org https://253fnuce.us-east.insforge.app https://cdn.insforge.dev https://worldvectorlogo.com;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://253fnuce.us-east.insforge.app https://cdn.insforge.dev;
frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';
[+ 'upgrade-insecure-requests' solo en prod]
```

- El nonce lo genera `proxy.ts` por petición, lo expone en la cabecera `x-nonce` y Next lo aplica automáticamente a sus scripts. El único `<script>` inline propio (init de tema del dashboard) lee el nonce con `headers()`.
- `'unsafe-eval'` solo en desarrollo (React lo usa para debugging); `'upgrade-insecure-requests'` solo en producción (rompería el `http://` local).
- `style-src` conserva `'unsafe-inline'` (bajo riesgo, evita romper estilos inline de React); las fuentes de Google del editor de diseño se permiten explícitamente en `style-src`/`font-src`, y el storage de InsForge (`cdn.insforge.dev`) y los logos (`worldvectorlogo.com`) en `img-src`.
- El framing queda **bloqueado de verdad** por `X-Frame-Options: DENY`.
- `X-Powered-By` se eliminó con `poweredByHeader: false`.
- El nonce exige **render dinámico**: por eso solo se usa en login (ya `force-dynamic`) y dashboard (dinámico por sesión), nunca en la store (ISR).

### Seguridad de la base de datos (RLS)

Las tablas del catálogo (`categorias`, `marcas`, `productos`) ya usan RLS (`auth.users`). Una auditoría de InsForge detectó **7 tablas sin RLS** expuestas a `anon` (advisor `rls-disabled`), demostrado con `GET /api/database/records/usuarios` → `200` + `password_hash`. Se corrigió en `migrations/20261015225629_proteger-tablas-sin-rls.sql`:

| Grupo | Tablas | Política |
|-------|--------|----------|
| Legacy/vacías | `usuarios`, `carrito`, `favoritos`, `valoraciones` | **Deny-all**: RLS activo **sin policies** → `anon`/`authenticated` no leen ni escriben (la API admin con API key no se ve afectada) |
| Datos de tienda | `pedidos`, `cupones`, `detalles_pedido` | **Owner-only** (`FOR ALL` con `USING` + `WITH CHECK`): solo el dueño (`tiendas.usuario_id = auth.uid()`). `detalles_pedido` valida vía `pedidos → tiendas`. Sin lectura anónima |
| Integridad del catálogo | `productos.categoria_id`, `productos.marca_id` | FKs con `ON DELETE SET NULL` (borrar una categoría/marca no rompe con un error crudo de FK) |

- `(SELECT auth.uid())` va envuelto en subquery para que se evalúe **una vez** y no por fila (rendimiento).
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
