-- ============================================================
-- MAKCED · Permitir a `anon` filtrar el catálogo por tienda
-- ------------------------------------------------------------
-- Causa: 20261018233928_restringir-lectura-anon-catalogo.sql hizo
--   REVOKE SELECT ON public.productos FROM anon;
--   GRANT SELECT (id, nombre, ...) ON public.productos TO anon;
-- Ese GRANT es a nivel de COLUMNA y NO incluía `tienda_id`.
--
-- En Postgres, `WHERE tienda_id = '...'` exige privilegio SELECT
-- sobre `tienda_id`. Sin él la consulta completa se aborta con:
--   ERROR 42501: permission denied for table productos
-- (Postgres reporta el error a nivel de tabla aunque el privilegio
--  que falta sea de columna.)
--
-- Efecto en la app: al pasar a multitienda path-based TODAS las
-- consultas filtran por `tienda_id`, así que la tienda pública
-- mostraba catálogo vacío (safeQuery captura el error y devuelve []).
--
-- Idempotente: GRANT repetido es no-op.
-- ============================================================

GRANT SELECT (tienda_id) ON public.productos  TO anon;
GRANT SELECT (tienda_id) ON public.categorias TO anon;
GRANT SELECT (tienda_id) ON public.marcas     TO anon;

-- Verificación rápida (debe devolver true en las tres):
--   SELECT has_column_privilege('anon','public.productos','tienda_id','SELECT'),
--          has_column_privilege('anon','public.categorias','tienda_id','SELECT'),
--          has_column_privilege('anon','public.marcas','tienda_id','SELECT');
