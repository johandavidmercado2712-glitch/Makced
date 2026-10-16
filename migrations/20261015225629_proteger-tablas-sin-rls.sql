-- =============================================
-- MAKCED - Proteger tablas sin RLS + policies dueño-de-tienda
-- Fecha: 2026-10-15
-- Hallazgo: 7 tablas expuestas a anon (advisor: rls-disabled ×7),
--   demostrado con GET /api/database/records/usuarios → 200 + password_hash.
-- =============================================

-- 1. DENY-ALL: tablas legacy/vacías sin uso en la app.
--    RLS activo SIN policies → anon/authenticated no leen ni escriben nada.
--    (la API admin / db query con API_KEY no se ve afectada)
ALTER TABLE public.usuarios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrito       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valoraciones  ENABLE ROW LEVEL SECURITY;

-- 2. PEDIDOS / CUPONES / DETALLES_PEDIDO: solo el dueño de la tienda.
--    Mismo patrón que el catálogo (20261009_auth_users_rls.sql), sin
--    select_public: los pedidos y cupones NO son lectura anónima.
--    (SELECT auth.uid()) envuelto en subquery: se evalúa una vez, no por fila.

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY pedidos_owner_all ON public.pedidos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = pedidos.tienda_id AND t.usuario_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = pedidos.tienda_id AND t.usuario_id = (SELECT auth.uid())
    )
  );

ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;

CREATE POLICY cupones_owner_all ON public.cupones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = cupones.tienda_id AND t.usuario_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tiendas t
      WHERE t.id = cupones.tienda_id AND t.usuario_id = (SELECT auth.uid())
    )
  );

ALTER TABLE public.detalles_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY detalles_pedido_owner_all ON public.detalles_pedido
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      JOIN public.tiendas t ON t.id = p.tienda_id
      WHERE p.id = detalles_pedido.pedido_id AND t.usuario_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      JOIN public.tiendas t ON t.id = p.tienda_id
      WHERE p.id = detalles_pedido.pedido_id AND t.usuario_id = (SELECT auth.uid())
    )
  );

-- 3. FKs del catálogo: al borrar una categoría/marca referenciada,
--    poner el producto en NULL en vez de fallar con error crudo de FK.
ALTER TABLE public.productos
  DROP CONSTRAINT productos_categoria_id_fkey,
  ADD CONSTRAINT productos_categoria_id_fkey
    FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;

ALTER TABLE public.productos
  DROP CONSTRAINT productos_marca_id_fkey,
  ADD CONSTRAINT productos_marca_id_fkey
    FOREIGN KEY (marca_id) REFERENCES public.marcas(id) ON DELETE SET NULL;
