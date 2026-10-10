-- =============================================
-- MAKCED - Migrar tiendas.usuario_id a auth.users + RLS
-- Fecha: 2026-10-09
-- Dueño asignado: jasontood2712@gmail.com (id e2f98408-caaa-4134-87ec-4cd0f4a2ca67)
-- =============================================

-- 1. Reasignar la tienda activa al dueño real de auth.users
-- (antes apuntaba al legacy d97792f0-04d8-420e-be20-d9ea0b415506 de public.usuarios)
UPDATE public.tiendas
SET usuario_id = 'e2f98408-caaa-4134-87ec-4cd0f4a2ca67'
WHERE id = '8fd0e65f-39f6-4445-ad45-735c3e772e83';

-- 2. Cambiar la FK de public.usuarios a auth.users
ALTER TABLE public.tiendas
  DROP CONSTRAINT tiendas_usuario_id_fkey;

ALTER TABLE public.tiendas
  ADD CONSTRAINT tiendas_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Activar RLS en tablas del catálogo
ALTER TABLE public.tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- 4. Policies TIENDAS: lectura pública, escritura solo dueño
CREATE POLICY tiendas_select_public ON public.tiendas
  FOR SELECT USING (true);

CREATE POLICY tiendas_owner_write ON public.tiendas
  FOR ALL USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- 5. Policies PRODUCTOS/MARCAS/CATEGORIAS:
-- lectura pública (la store las necesita), escritura solo dueño de la tienda
CREATE POLICY productos_select_public ON public.productos
  FOR SELECT USING (true);

CREATE POLICY productos_owner_write ON public.productos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = productos.tienda_id AND t.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = productos.tienda_id AND t.usuario_id = auth.uid()
    )
  );

CREATE POLICY marcas_select_public ON public.marcas
  FOR SELECT USING (true);

CREATE POLICY marcas_owner_write ON public.marcas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = marcas.tienda_id AND t.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = marcas.tienda_id AND t.usuario_id = auth.uid()
    )
  );

CREATE POLICY categorias_select_public ON public.categorias
  FOR SELECT USING (true);

CREATE POLICY categorias_owner_write ON public.categorias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = categorias.tienda_id AND t.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = categorias.tienda_id AND t.usuario_id = auth.uid()
    )
  );
