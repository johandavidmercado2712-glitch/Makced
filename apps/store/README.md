# Makced Store

Tienda de calzado y ropa deportiva. Parte del monorepo [Makced](../../README.md).

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Estilos:** Tailwind CSS v4
- **Backend:** [InsForge](https://insforge.dev) (Postgres, Auth, Storage, Functions)
- **Paquete del monorepo:** `@makced/store`

## Desarrollo

```bash
# Desde la raíz del monorepo
npm run dev              # corre todas las apps
npx turbo dev --filter=@makced/store   # solo esta app, puerto 3000
```

URL: http://localhost:3000

## Configuración

`.env.local` del monorepo ya cubre esta app; asegúrate de tener:

```
NEXT_PUBLIC_INSFORGE_URL=https://i65mdj5r.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_9b2c36cbad3e9371fc147c22ade8386a
```

## Código compartido

La autenticación y la conexión a InsForge viven en paquetes del monorepo, no en esta app:

- **Cliente/sesión/auth:** `@makced/db` (`client`, `actions`, `proxy`, `refresh`, `server`)
- **Componentes (Nav, Footer):** `@makced/ui`
- `apps/store/proxy.ts` — re-exporta el proxy de sesión de `@makced/db`
- `apps/store/app/api/auth/refresh/route.ts` — re-exporta el refresh de `@makced/db`

## Links

- Documentación InsForge: https://insforge.dev/docs
- SDK Reference: `node_modules/@insforge/sdk/SDK-REFERENCE.md`
