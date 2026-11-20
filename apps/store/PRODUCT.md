# PRODUCT.md — Makced Store

## Product

Makced Store es la tienda pública de la plataforma Makced: un e-commerce de calzado y ropa deportiva (calzado y ropa deportiva), parte del monorepo Makced.

## Primary user

Consumidores finales que compran calzado y ropa deportiva para uso personal. Navegan por marca y categoría, comparan modelos y compran a través de la tienda.

## Value proposition

Variedad de marcas y modelos: un catálogo amplio que abarca múltiples marcas deportivas y líneas de producto, facilitando encontrar el calzado/prenda adecuado en un solo lugar.

## Platform

web

## Stack

- Frontend: Next.js 16, React 19, TypeScript
- Estilos: Tailwind CSS v4, DaisyUI
- Backend: InsForge (Postgres, Auth, Storage, Functions) vía `@makced/db`
- Paquete del monorepo: `@makced/store` (Turborepo + npm workspaces)
- UI compartida: `@makced/ui` (Nav, Footer)
- Servidor de desarrollo: puerto 3000

## Durable constraints / assets to preserve

- Catálogo de productos con marcas y categorías ya almacenado en la base de datos (InsForge/Postgres); el trabajo futuro no debe romper los datos ni las rutas existentes del catálogo.
- Integración con InsForge (auth, storage) vía el paquete compartido `@makced/db`; no duplicar la lógica de cliente/auth en esta app.
- Las rutas y la estructura de páginas existentes (home, categorias, marcas, novedades, carrito, verProducto) son incumbent; preservar el comportamiento fuera del alcance de cualquier cambio.

## Deliberately undecided

- Identidad visual / sistema de diseño: aún no documentado. Ejecutar `$impeccable document` para registrar el sistema incumbent, o `$impeccable shape` antes de trabajo visual nuevo.
- Ruta de build (comp-first vs code-first): no registrada; se aplican defaults por sesión.
EOF