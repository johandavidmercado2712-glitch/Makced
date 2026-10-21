export interface ProductoCardData {
  id: string;
  nombre: string;
  precio: number;
  precio_descuento: number | null;
  imagen_url: string | null;
  slug: string | null;
  marca: string | null;
}

export interface PanelInfoProps {
  image:string
  titulo: string
  descripcion: string
  link: string
  button:string
}