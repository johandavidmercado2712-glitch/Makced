-- =============================================
-- MAKCED - Las policies de "owner" aplican solo a authenticated
-- Fecha: 2026-10-18
-- Necesario tras restringir la lectura anónima del catálogo.
--
-- Las policies <t>_owner_* son FOR ALL TO public y su subconsulta lee
-- tiendas.usuario_id (EXISTS ... FROM tiendas t WHERE t.usuario_id = auth.uid()).
-- Al hacer REVOKE SELECT ... FROM anon sobre public.tiendas, el rol anon ya no
-- puede evaluar esa subconsulta: cualquier SELECT anónimo sobre una tabla con
-- una de estas policies fallaba con "permission denied for table tiendas"
-- cuando una fila no cumplía la policy pública (p. ej. estado = false).
--
-- Como estas policies son de ESCRITURA y de lectura COMPLETA del dueño, solo
-- tienen sentido para usuarios con sesión. Se limitan a `authenticated`, de modo
-- que el anon únicamente evalúe las policies <t>_select_public (que ya no
-- referencian tiendas). El dashboard usa el cliente de SESIÓN y sigue cubierto.
-- =============================================

ALTER POLICY tiendas_owner_write      ON public.tiendas          TO authenticated;
ALTER POLICY productos_owner_write    ON public.productos        TO authenticated;
ALTER POLICY marcas_owner_write       ON public.marcas           TO authenticated;
ALTER POLICY categorias_owner_write   ON public.categorias       TO authenticated;
ALTER POLICY pedidos_owner_all        ON public.pedidos          TO authenticated;
ALTER POLICY cupones_owner_all        ON public.cupones          TO authenticated;
ALTER POLICY detalles_pedido_owner_all ON public.detalles_pedido TO authenticated;
