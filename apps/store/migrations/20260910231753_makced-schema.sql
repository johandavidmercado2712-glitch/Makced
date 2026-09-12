-- =============================================
-- MAKCED - Schema de Base de Datos
-- Tienda de sneakers multi-tienda
-- =============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLA USUARIOS
-- =============================================
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'admin'
        CHECK (rol IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. TABLA TIENDAS
-- =============================================
CREATE TABLE public.tiendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre_tienda VARCHAR(150) NOT NULL,
    subdominio VARCHAR(100) UNIQUE NOT NULL,
    plan_actual VARCHAR(20) NOT NULL DEFAULT 'basico'
        CHECK (plan_actual IN ('basico', 'pro', 'enterprise')),
    plantilla_id VARCHAR(50),
    color_principal VARCHAR(7) DEFAULT '#4CE1AC',
    logo_url TEXT,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. TABLA PRODUCTOS
-- =============================================
CREATE TABLE public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_descuento DECIMAL(10,2),
    stock INTEGER NOT NULL DEFAULT 0,
    imagen_url TEXT,
    slug VARCHAR(250),
    estado BOOLEAN DEFAULT true,
    es_nuevo BOOLEAN DEFAULT false,
    es_destacado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. TABLA PEDIDOS
-- =============================================
CREATE TABLE public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(200) NOT NULL,
    cliente_email VARCHAR(255),
    cliente_telefono VARCHAR(20),
    cliente_direccion TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado_pedido VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado_pedido IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
    metodo_pago VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. TABLA DETALLES_PEDIDO (items del pedido)
-- =============================================
CREATE TABLE public.detalles_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- =============================================
-- 6. TABLA CATEGORIAS
-- =============================================
CREATE TABLE public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    imagen_url TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. TABLA MARCAS
-- =============================================
CREATE TABLE public.marcas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    logo_url TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. TABLA CARRITO
-- =============================================
CREATE TABLE public.carrito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. TABLA FAVORITOS
-- =============================================
CREATE TABLE public.favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- =============================================
-- 10. TABLA VALORACIONES
-- =============================================
CREATE TABLE public.valoraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    puntuacion INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- =============================================
-- 11. TABLA CUPONES
-- =============================================
CREATE TABLE public.cupones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    descuento_porcentaje DECIMAL(5,2),
    descuento_fijo DECIMAL(10,2),
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    uso_maximo INTEGER,
    uso_actual INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tienda_id, codigo)
);

-- =============================================
-- ÍNDICES para performance
-- =============================================
CREATE INDEX idx_productos_tienda ON public.productos(tienda_id);
CREATE INDEX idx_productos_estado ON public.productos(estado);
CREATE INDEX idx_pedidos_tienda ON public.pedidos(tienda_id);
CREATE INDEX idx_pedidos_estado ON public.pedidos(estado_pedido);
CREATE INDEX idx_categorias_tienda ON public.categorias(tienda_id);
CREATE INDEX idx_marcas_tienda ON public.marcas(tienda_id);
CREATE INDEX idx_carrito_usuario ON public.carrito(usuario_id);
CREATE INDEX idx_favoritos_usuario ON public.favoritos(usuario_id);
CREATE INDEX idx_valoraciones_producto ON public.valoraciones(producto_id);

-- =============================================
-- COMENTARIOS en tablas
-- =============================================
COMMENT ON TABLE public.usuarios IS 'Usuarios registrados de la plataforma MAKCED';
COMMENT ON TABLE public.tiendas IS 'Tiendas virtuales creadas por los usuarios';
COMMENT ON TABLE public.productos IS 'Catálogo de productos por tienda';
COMMENT ON TABLE public.pedidos IS 'Pedidos realizados en cada tienda';
COMMENT ON TABLE public.detalles_pedido IS 'Detalle de productos incluidos en cada pedido';
COMMENT ON TABLE public.categorias IS 'Categorías de productos por tienda';
COMMENT ON TABLE public.marcas IS 'Marcas comerciales disponibles';
COMMENT ON TABLE public.carrito IS 'Carrito de compras por usuario';
COMMENT ON TABLE public.favoritos IS 'Productos marcados como favoritos';
COMMENT ON TABLE public.valoraciones IS 'Valoraciones y reviews de productos';
COMMENT ON TABLE public.cupones IS 'Cupones de descuento por tienda';
