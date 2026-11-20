export interface ProductoCardData {
  id: string;
  nombre: string;
  precio: number;
  precio_descuento: number | null;
  imagen_url: string | null;
  slug: string | null;
  marca: string | null;
  descripcion?: string | null;
  stock?: number | null;
  es_nuevo?: boolean | null;
  es_destacado?: boolean | null;
  referencia?: unknown;
  categoria?: string | null;
  colores?: unknown;
}

export interface PanelInfoProps {
  image:string
  titulo: string
  descripcion: string
  link: string
  button:string
}