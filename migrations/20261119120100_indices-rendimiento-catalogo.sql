-- ============================================================
-- MAKCED · Índices para las consultas reales del catálogo
-- ------------------------------------------------------------
-- Todas las lecturas públicas filtran por tenant + estado:
--   WHERE tienda_id = $1 AND estado = true   (productos)
--   WHERE tienda_id = $1 AND activa = true   (categorias / marcas)
--
-- 20261030120000_multitienda_indices.sql crea índices ÚNICOS
-- (tienda_id, slug) / (tienda_id, nombre), que sirven para resolver
-- un slug concreto pero NO para listar el catálogo de una tienda.
-- De ahí los picos de 3-11s en las páginas del home.
--
-- Idempotente: IF NOT EXISTS.
-- ============================================================

-- Productos: listar los publicados de una tienda
CREATE INDEX IF NOT EXISTS productos_tienda_estado_idx
  ON public.productos (tienda_id, estado)
  WHERE eliminado_en IS NULL;

-- Categorías: listar las activas de una tienda
CREATE INDEX IF NOT EXISTS categorias_tienda_activa_idx
  ON public.categorias (tienda_id, activa)
  WHERE eliminado_en IS NULL;

-- Marcas: listar las activas de una tienda
CREATE INDEX IF NOT EXISTS marcas_tienda_activa_idx
  ON public.marcas (tienda_id, activa)
  WHERE eliminado_en IS NULL;

-- Refrescar estadísticas para que el planner use los índices nuevos
ANALYZE public.productos;
ANALYZE public.categorias;
ANALYZE public.marcas;
ANALYZE public.tiendas;
