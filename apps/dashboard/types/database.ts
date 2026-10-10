export interface Tienda {
  id: string;
  usuario_id: string | null;
  nombre_tienda: string;
  subdominio: string;
  plan_actual: string;
  propietario: string | null;
  plantilla_id: string | null;
  color_principal: string;
  logo_url: string | null;
  descripcion: string | null;
  activa: boolean;
  created_at: string;
  diseno: unknown;
}

export interface UsuarioCuenta {
  email: string;
  nombre: string | null;
}

export interface Producto {
  id: string;
  tienda_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  precio_descuento: number | null;
  stock: number;
  imagen_url: string | null;
  imagen_key: string | null;
  slug: string | null;
  estado: boolean;
  es_nuevo: boolean;
  es_destacado: boolean;
  created_at: string;
}

export interface Categoria {
  id: string;
  tienda_id: string;
  nombre: string;
  slug: string;
  imagen_url: string | null;
  activa: boolean;
}

export interface CategoriaSimple {
  id: string;
  nombre: string;
  slug: string;
  imagen_url: string | null;
}

export interface Marca {
  id: string;
  tienda_id: string;
  nombre: string;
  logo_url: string | null;
  imagen_url: string | null;
  activa: boolean;
}

export interface MarcaSimple {
  id: string;
  nombre: string;
  logo_url: string | null;
  imagen_url: string | null;
}

export interface MarcaAdmin {
  id: string;
  nombre: string;
  logo_url: string | null;
  logo_key: string | null;
  activa: boolean;
  created_at: string;
}

export interface CategoriaAdmin {
  id: string;
  nombre: string;
  slug: string;
  imagen_url: string | null;
  imagen_key: string | null;
  activa: boolean;
  created_at: string;
}

export interface ProductoConRelaciones extends Producto {
  marca?: Marca;
  categoria?: Categoria;
  valoraciones?: Valoracion[];
}

export interface Valoracion {
  id: string;
  usuario_id: string;
  producto_id: string;
  puntuacion: number;
  comentario: string | null;
}

export interface RefSimple {
  id: string;
  nombre: string;
}

export interface ProductoLista {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  precio_descuento: number | null;
  stock: number;
  imagen_url: string | null;
  imagen_key: string | null;
  slug: string | null;
  estado: boolean;
  es_nuevo: boolean;
  es_destacado: boolean;
  marca: RefSimple | null;
  categoria: RefSimple | null;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string | null;
  precio?: number;
  precio_descuento?: number | null;
  stock?: number;
  imagen_url?: string | null;
  imagen_key?: string | null;
  estado?: boolean;
  es_nuevo?: boolean;
  es_destacado?: boolean;
  marca_id?: string | null;
  categoria_id?: string | null;
  updated_at?: string;
}
