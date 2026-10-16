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
