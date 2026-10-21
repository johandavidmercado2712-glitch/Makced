-- =============================================
-- MAKCED - Restringir la lectura anónima del catálogo público
-- Fecha: 2026-10-18
-- Hallazgo (advisor): rls-permissive/critical en public.marcas,
--   public.productos y public.categorias. Sus policies de SELECT eran
--   FOR SELECT USING (true) TO public: cualquier anónimo leía TODAS las filas
--   y TODAS las columnas, incluidas las internas (logo_key / imagen_key,
--   tienda_id, created_at, updated_at).
--
-- El catálogo SÍ es público (la web se sirve sin sesión), así que NO se aplica
-- la recomendación genérica del advisor (USING auth.uid() = user_id: esa
-- columna no existe aquí y rompería la tienda). Se combinan dos controles por
-- tabla:
--   1) fila:     anon solo ve los registros publicados (activa / estado = true);
--   2) columnas: anon solo tiene SELECT sobre la proyección pública.
-- La lectura COMPLETA del dueño (dashboard) la cubre <t>_owner_write (FOR ALL con
-- EXISTS(tiendas ... auth.uid())) y se hace con el cliente de SESIÓN, no con anon.
-- =============================================

-- ---------- marcas ----------
DROP POLICY IF EXISTS marcas_select_public ON public.marcas;

CREATE POLICY marcas_select_public ON public.marcas
  FOR SELECT TO anon
  USING (activa = true);

REVOKE SELECT ON public.marcas FROM anon;
GRANT SELECT (id, nombre, logo_url, imagen_url, activa) ON public.marcas TO anon;

-- ---------- categorias ----------
DROP POLICY IF EXISTS categorias_select_public ON public.categorias;

CREATE POLICY categorias_select_public ON public.categorias
  FOR SELECT TO anon
  USING (activa = true);

REVOKE SELECT ON public.categorias FROM anon;
GRANT SELECT (id, nombre, slug, imagen_url, activa) ON public.categorias TO anon;

-- ---------- productos ----------
DROP POLICY IF EXISTS productos_select_public ON public.productos;

CREATE POLICY productos_select_public ON public.productos
  FOR SELECT TO anon
  USING (estado = true);

REVOKE SELECT ON public.productos FROM anon;
GRANT SELECT (
  id,
  nombre,
  descripcion,
  precio,
  precio_descuento,
  stock,
  imagen_url,
  slug,
  estado,
  es_nuevo,
  es_destacado,
  colores,
  referencia,
  categoria_id,
  marca_id
) ON public.productos TO anon;
