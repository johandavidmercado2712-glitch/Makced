# Reporte de Seguridad — Makced (ZAP 2.16.0)

**Fecha del escaneo:** 30 oct 2026
**Herramienta:** OWASP ZAP 2.16.0 (spider + passive + active scan)
**Objetivo:** `http://localhost:3000` (store), `:3001` (login), `:3002` (dashboard) en modo producción (`next build` + `next start`)
**Informe detallado:** `/tmp/zap-makced-report.html`

## 1. Resumen ejecutivo

- Se ejecutó un escaneo completo (spider recursivo + análisis pasivo + escaneo activo) sobre las tres aplicaciones en modo producción.
- **No se detectaron hallazgos High ni Critical.**
- El hallazgo "Medium — CSP `script-src unsafe-eval`" que reportaba ZAP en desarrollo **no aparece en producción** (era un falso positivo de dev: `'unsafe-eval'` solo se añade cuando `NODE_ENV === "development"`).
- El hallazgo "Medium — CSP `script-src unsafe-inline`" persiste **solo en la store** y se documenta como **riesgo aceptado** (Opción A) para preservar el ISR.
- Login y dashboard **no** reportan `script-src unsafe-inline` (usan CSP con nonce dinámico vía `proxy.ts`).

## 2. Resultados por aplicación

| App | `script-src unsafe-eval` | `script-src unsafe-inline` | `style-src unsafe-inline` | Otros Medium |
|---|---|---|---|---|
| Store (:3000) | ❌ Ausente | ⚠️ 56 (aceptado) | ⚠️ 56 (aceptado) | — |
| Login (:3001) | ❌ Ausente | ❌ Ausente | ⚠️ 4 (aceptado) | CSP no configurada en rutas estáticas (x3) |
| Dashboard (:3002) | ❌ Ausente | ❌ Ausente | ⚠️ 4 (aceptado) | — |

## 3. Hallazgo: CSP `script-src 'unsafe-inline'` en la store (riesgo aceptado)

**Justificación:** la store usa CSP estática (`apps/store/next.config.ts`) para no perder el ISR (un nonce obligaría a render dinámico en cada petición, degradando el rendimiento). `'unsafe-inline'` es necesario para la hidratación de Next sin nonce.

**Controles compensatorios:**
1. React escapa automáticamente todo el contenido renderizado (nombres, descripciones, títulos de productos/marcas/categorías).
2. El único `dangerouslySetInnerHTML` con datos (`apps/store/app/verProducto/page.tsx`) es un JSON-LD serializado con `.replace(/</g, "\u003c")`.
3. El otro `dangerouslySetInnerHTML` (`apps/store/app/layout.tsx`) inyecta `TEMA_INIT_SCRIPT`, constante estática hardcodeada sin entrada de usuario.
4. `connect-src` restringido a `'self'` + dominio InsForge → impide exfiltración a dominios externos.
5. `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `object-src 'none'` en fuerza.
6. Las URLs del pie se validan con `esUrlPieValida` (`packages/db/src/diseno.ts`), que rechaza esquemas peligrosos (`javascript:`, `data:`) y solo permite rutas internas, `http(s)`, `mailto` y `tel`.
7. Login y dashboard usan CSP con nonce (`script-src 'self' 'nonce-…' 'strict-dynamic'`), eliminando `'unsafe-inline'` de `script-src` en esas zonas.

**Mitigación adicional recomendada (futura):** re-evaluar si la store supera un tráfico significativo o se añade un WAF delante (Cloudflare). Considerar migrar a nonce si se sacrifica ISR o se adopta render dinámico.

## 4. Hallazgo menor: CSP no configurada en rutas estáticas del login

ZAP reporta "CSP no configurada" en `/robots.txt`, `/sitemap.xml` y `/_next/*` del login. Estas rutas son servidas por Next sin pasar por el middleware (matcher las excluye). El homepage y las rutas dinámicas sí envían CSP (verificado con `curl -sI`). Impacto bajo; aceptable.

## 5. `style-src 'unsafe-inline'` (todas las apps)

Se mantiene en las tres apps (bajo riesgo: solo permite CSS inline, no ejecución de código). Documentado como aceptado. Evita romper estilos inline de React.

## 6. Verificación

- Confirmado con `curl -sI http://localhost:3000` que la cabecera de producción **no** incluye `'unsafe-eval'` ni `http://localhost:8400`.
- Confirmado que login (`:3001`) y dashboard (`:3002`) generan nonce por petición (`script-src 'self' 'nonce-…' 'strict-dynamic'`).
- Los 39 tests E2E pasan; los 3 apps compilan en producción sin errores.

## 8. Escaneo autenticado del dashboard (ZAP + cookie de sesión)

Se inyectó la cookie de sesión real (obtenida vía login con Playwright) mediante el add-on Replacer de ZAP y se re-escaneó el dashboard completo.

**Rutas escaneadas (autenticado):** `/productos`, `/marcas`, `/diseno`, `/mi-tienda` + assets.

**Resultado:**
- **Sin `script-src unsafe-inline`** (nonce operativo) ✅
- **Sin alertas de XSS, inyección SQL, path traversal ni bypass de autenticación** ✅
- Solo `style-src unsafe-inline` (x6) + informativos + redirección (307 a login en sub-rutas) — aceptados.

## 9. Cookies de sesión

Capturadas al iniciar sesión (Playwright):

| Cookie | HttpOnly | Secure | SameSite | Observación |
|---|---|---|---|---|
| `insforge_access_token` | ❌ false | ✅ true | Lax | **Riesgo:** el token de acceso es legible por JS → amplifica el impacto de un XSS. Establecida por el SDK de InsForge. Recomendación: verificar si el SDK soporta `httpOnly` para el access token (o reducir su lifetime). |
| `insforge_refresh_token` | ✅ true | ✅ true | Lax | Correcto. |

## 10. Otros controles verificados

- **Open redirect:** el login no acepta parámetro `redirect`/`next` (el destino es fijo `DASHBOARD_URL` desde env). ✅ No vulnerable.
- **CSRF:** no probado empíricamente (requiere origen cruzado). Mitigación en vigor: validación de `Origin` en server actions de Next.js + cookies `SameSite=Lax`.
- **Rate limiting:** no probado (riesgo de bloqueo). Recomendación: añadir rate limit al endpoint de login (InsForge o middleware).
- **IDOR / autorización:** no probado con ZAP. Requiere prueba manual con 2 cuentas (las policies RLS deberían cubrirlo; verificar).
- **Upload de imágenes:** no ejercitado por ZAP. Probar manualmente bypass de MIME/extensión/tamaño.
- **XSS almacenado:** no probado por ZAP. React escapa por defecto; verificar con un payload de prueba en un producto y borrarlo después.
- **TLS real:** en local es HTTP; en producción validar versiones/cifrados/cert con sslyze o ZAP sobre HTTPS.
- **SCA:** ejecutar `npm audit` por separado.

## 12. Hallazgo npm audit: zod CVE-2023-54404 (no explotable)

`npm audit` reporta 3 vulnerabilidades high, todas derivadas de una sola causa raíz: `@insforge/sdk → @insforge/shared-schemas → zod@3.25.76` (advisory GHSA-mrhx-c7xc-m3w5, zod `<4.6.6`).

**No es explotable en Makced:**
- Ningún código de la app importa `zod` directamente ni lo declara como dependencia.
- El SDK usa `@insforge/shared-schemas` únicamente para `ERROR_CODES` (constante) y tipos TypeScript; no invoca `.parse()`/`.safeParse()` en runtime (grep en `sdk/dist` → 0 resultados).
- `shared-schemas` solo define los esquemas al cargar; no valida arrays de entrada de usuario.
- Las entradas de usuario llegan vía server actions con límite de body de Next.js (~1 MB) y están acotadas por los formularios.

**Decisión:** aceptar y documentar (Opción A). No se fuerza `overrides` a zod 4 (fuera del rango `^3.23.8` del SDK, riesgo de romperlo). Revisar cuando InsForge publique un SDK con zod ≥4.6.6. No hay fix disponible actualmente (última versión del SDK: 1.5.2).

