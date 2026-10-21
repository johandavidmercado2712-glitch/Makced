-- =============================================
-- MAKCED - Restringir la lectura anónima de public.tiendas
-- Fecha: 2026-10-18
-- Hallazgo (advisor): rls-permissive/critical en public.tiendas
--   (tiendas_select_public). La policy era FOR SELECT USING (true) TO public,
--   así que cualquier anónimo leía la fila COMPLETA, incluidas columnas
--   privadas: usuario_id, propietario, plan_actual, created_at, updated_at.
--
-- La tienda pública SÍ necesita leer la fila de la tienda activa (color,
-- logo, diseño, WhatsApp), pero solo columnas seguras. Por eso NO se aplica la
-- recomendación genérica del advisor (USING auth.uid() = usuario_id: rompería
-- la web pública). En su lugar se combinan dos controles:
--   1) fila: anon solo ve la tienda ACTIVA;
--   2) columnas: anon solo tiene SELECT sobre la proyección pública.
-- La lectura del dueño (dashboard) la cubre tiendas_owner_write (FOR ALL con
-- auth.uid() = usuario_id) y se hace con el cliente de sesión, no con anon.
-- =============================================

-- 1. Fila: anon solo la tienda activa (antes: USING (true) TO public).
DROP POLICY IF EXISTS tiendas_select_public ON public.tiendas;

CREATE POLICY tiendas_select_public ON public.tiendas
  FOR SELECT TO anon
  USING (activa = true);

-- 2. Columnas: quitar el SELECT amplio de anon y devolver solo la proyección
--    pública. Pedir usuario_id / propietario / plan_actual como anon fallará.
REVOKE SELECT ON public.tiendas FROM anon;

GRANT SELECT (
  id,
  nombre_tienda,
  subdominio,
  plantilla_id,
  color_principal,
  logo_url,
  descripcion,
  activa,
  diseno,
  whatsapp_numero
) ON public.tiendas TO anon;
