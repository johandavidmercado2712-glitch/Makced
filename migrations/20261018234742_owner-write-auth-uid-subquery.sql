-- =============================================
-- MAKCED - owner_write: auth.uid() en subquery (rendimiento)
-- Fecha: 2026-10-18
-- El advisor marca `rls-policy-perf` en estas policies porque usan
-- auth.uid() directo y se evalúa por fila. Se envuelve en (SELECT auth.uid())
-- para que se evalúe una sola vez por consulta (mismo patrón que
-- pedidos_owner_all / cupones_owner_all / detalles_pedido_owner_all).
-- Se recrean como FOR ALL TO authenticated (ver migración
-- 20261018234320_owner-policies-solo-authenticated.sql).
-- =============================================

DROP POLICY IF EXISTS tiendas_owner_write ON public.tiendas;
CREATE POLICY tiendas_owner_write ON public.tiendas
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = usuario_id)
  WITH CHECK ((SELECT auth.uid()) = usuario_id);

DROP POLICY IF EXISTS productos_owner_write ON public.productos;
CREATE POLICY productos_owner_write ON public.productos
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tiendas t
    WHERE t.id = productos.tienda_id AND t.usuario_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tiendas t
    WHERE t.id = productos.tienda_id AND t.usuario_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS marcas_owner_write ON public.marcas;
CREATE POLICY marcas_owner_write ON public.marcas
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tiendas t
    WHERE t.id = marcas.tienda_id AND t.usuario_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tiendas t
    WHERE t.id = marcas.tienda_id AND t.usuario_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS categorias_owner_write ON public.categorias;
CREATE POLICY categorias_owner_write ON public.categorias
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tiendas t
    WHERE t.id = categorias.tienda_id AND t.usuario_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tiendas t
    WHERE t.id = categorias.tienda_id AND t.usuario_id = (SELECT auth.uid())
  ));
