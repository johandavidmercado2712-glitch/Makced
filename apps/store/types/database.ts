export interface Tienda {
  id: string;
  nombre_tienda: string;
  subdominio: string;
  plan_actual: string;
  color_principal: string;
  logo_url: string | null;
  descripcion: string | null;
  activa: boolean;
  created_at: string;
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

export interface Marca {
  id: string;
  tienda_id: string;
  nombre: string;
  logo_url: string | null;
  activa: boolean;
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