# MakcedStore

Tienda de calzado y ropa deportiva.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Estilos:** Tailwind CSS v4
- **Backend:** [InsForge](https://insforge.dev) (Postgres, Auth, Storage, Functions)

## InsForge Backend

- **Project:** Makced
- **API Base:** `https://i65mdj5r.us-east.insforge.app`
- **Dashboard:** https://insforge.dev/dashboard/project/7c861cfd-77d7-4e09-9888-19d33388edae

## Variables de Entorno

`.env.local`:

```
NEXT_PUBLIC_INSFORGE_URL=https://i65mdj5r.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_9b2c36cbad3e9371fc147c22ade8386a
```

## InsForge CLI

```bash
# Instalar
npm install -g @insforge/cli

# Login
insforge login --user-api-key uak_...

# Vincular proyecto
insforge link --project-id 7c861cfd-77d7-4e09-9888-19d33388edae
```

## Estructura del Proyecto

- `proxy.ts` — Manejo de sesiones (reemplaza middleware en Next.js 16)
- `lib/insforge.ts` — Cliente browser del SDK
- `app/api/auth/refresh/route.ts` — Endpoint para refrescar tokens
- `app/actions.ts` — Server actions para auth (signIn, signUp, signOut)

## Desarrollo

```bash
npm run dev
```

http://localhost:3000

## Links

- Documentación InsForge: https://insforge.dev/docs
- SDK Reference: `node_modules/@insforge/sdk/SDK-REFERENCE.md`
