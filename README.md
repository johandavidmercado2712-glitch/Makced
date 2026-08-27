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
- Un proyecto InsForge (este repositorio usa el proyecto **Makced**)

## Instalación

```bash
npm install
```

## Configuración de variables de entorno

Copia las credenciales de InsForge en el archivo `.env.local` de **cada** aplicación:

```
# apps/store/.env.local, apps/login/.env.local, apps/dashboard/.env.local
NEXT_PUBLIC_INSFORGE_URL=https://i65mdj5r.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_9b2c36cbad3e9371fc147c22ade8386a
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
```

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

InsForge **Makced**:

- **API Base:** `https://i65mdj5r.us-east.insforge.app`
- **Dashboard:** https://insforge.dev/dashboard/project/7c861cfd-77d7-4e09-9888-19d33388edae

### InsForge CLI

```bash
# Instalar
npm install -g @insforge/cli

# Login
insforge login --user-api-key uak_...

# Vincular proyecto (desde la raíz del monorepo)
insforge link --project-id 7c861cfd-77d7-4e09-9888-19d33388edae
```

## Links

- Documentación InsForge: https://insforge.dev/docs
- SDK Reference: `node_modules/@insforge/sdk/SDK-REFERENCE.md`
