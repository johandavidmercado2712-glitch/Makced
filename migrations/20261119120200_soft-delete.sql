-- Migración: Soft-delete para productos, marcas y categorías
-- Agrega columna `eliminado_en` para permitir undo temporal
-- Los registros eliminados se filtran automáticamente en queries
-- Job posterior limpia registros >30 días

-- ========== PRODUCTOS ==========
ALTER TABLE public.productos
ADD COLUMN IF NOT EXISTS eliminado_en TIMESTAMPTZ NULL;

-- Índice para queries de limpieza
CREATE INDEX IF NOT EXISTS idx_productos_eliminado_en 
ON public.productos(eliminado_en) 
WHERE eliminado_en IS NOT NULL;

-- Actualizar policy RLS para incluir filtro de soft-delete
DROP POLICY IF EXISTS productos_select_public ON public.productos;
CREATE POLICY productos_select_public ON public.productos
FOR SELECT TO authenticated
USING (
  eliminado_en IS NULL 
  AND estado = true
  AND tienda_id IN (
    SELECT id FROM public.tiendas 
    WHERE activa = true
  )
);

DROP POLICY IF EXISTS productos_owner_read ON public.productos;
CREATE POLICY productos_owner_read ON public.productos
FOR SELECT TO authenticated
USING (
  eliminado_en IS NULL
  AND tienda_id IN (
    SELECT id FROM public.tiendas 
    WHERE usuario_id = (SELECT auth.uid())
  )
);

-- ========== MARCAS ==========
ALTER TABLE public.marcas
ADD COLUMN IF NOT EXISTS eliminado_en TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_marcas_eliminado_en 
ON public.marcas(eliminado_en) 
WHERE eliminado_en IS NOT NULL;

DROP POLICY IF EXISTS marcas_select_public ON public.marcas;
CREATE POLICY marcas_select_public ON public.marcas
FOR SELECT TO authenticated
USING (
  eliminado_en IS NULL 
  AND activa = true
);

DROP POLICY IF EXISTS marcas_owner_read ON public.marcas;
CREATE POLICY marcas_owner_read ON public.marcas
FOR SELECT TO authenticated
USING (
  eliminado_en IS NULL
  AND tienda_id IN (
    SELECT id FROM public.tiendas 
    WHERE usuario_id = (SELECT auth.uid())
  )
);

-- ========== CATEGORÍAS ==========
ALTER TABLE public.categorias
ADD COLUMN IF NOT EXISTS eliminado_en TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_categorias_eliminado_en 
ON public.categorias(eliminado_en) 
WHERE eliminado_en IS NOT NULL;

DROP POLICY IF EXISTS categorias_select_public ON public.categorias;
CREATE POLICY categorias_select_public ON public.categorias
FOR SELECT TO authenticated
USING (
  eliminado_en IS NULL 
  AND activa = true
);

DROP POLICY IF EXISTS categorias_owner_read ON public.categorias;
CREATE POLICY categorias_owner_read ON public.categorias
FOR SELECT TO authenticated
USING (
  eliminado_en IS NULL
  AND tienda_id IN (
    SELECT id FROM public.tiendas 
    WHERE usuario_id = (SELECT auth.uid())
  )
);

-- Nota: La limpieza automática de registros >30 días se configura
-- en InsForge como un scheduled function o cron job externo
