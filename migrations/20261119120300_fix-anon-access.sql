-- Fix RLS policies to allow anonymous access to public data
-- This fixes the issue where the store cannot load products/categories

-- Productos: Allow anonymous access to active, non-deleted products from active stores
DROP POLICY IF EXISTS productos_select_public ON public.productos;
CREATE POLICY productos_select_public ON public.productos
FOR SELECT TO anon
USING (
  eliminado_en IS NULL 
  AND estado = true
  AND tienda_id IN (
    SELECT id FROM public.tiendas 
    WHERE activa = true
  )
);

-- Categorías: Allow anonymous access to active, non-deleted categories
DROP POLICY IF EXISTS categorias_select_public ON public.categorias;
CREATE POLICY categorias_select_public ON public.categorias
FOR SELECT TO anon
USING (
  eliminado_en IS NULL 
  AND activa = true
);

-- Marcas: Allow anonymous access to active, non-deleted brands
DROP POLICY IF EXISTS marcas_select_public ON public.marcas;
CREATE POLICY marcas_select_public ON public.marcas
FOR SELECT TO anon
USING (
  eliminado_en IS NULL 
  AND activa = true
);
