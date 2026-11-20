-- MAKCED - Multitienda path-based: índices y unicidad por tenant

-- 1. Índice único parcial para subdominio activo
CREATE UNIQUE INDEX IF NOT EXISTS tiendas_subdominio_activo_uq
  ON public.tiendas (subdominio)
  WHERE activa = true;

-- 2. Unicidad de slug por tienda (excluyendo soft-deleted)
CREATE UNIQUE INDEX IF NOT EXISTS categorias_tienda_slug_uq
  ON public.categorias (tienda_id, slug)
  WHERE eliminado_en IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS marcas_tienda_nombre_uq
  ON public.marcas (tienda_id, nombre)
  WHERE eliminado_en IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS productos_tienda_slug_uq
  ON public.productos (tienda_id, slug)
  WHERE eliminado_en IS NULL;
