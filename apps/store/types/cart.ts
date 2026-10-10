export interface CartItem {
  id: string;
  slug: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  cantidad: number;
  talla?: number;
  color?: string;
}

export interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  showPrices: boolean;
  addItem: (product: ProductoCart, talla?: number, color?: string) => void;
  removeItem: (id: string, talla?: number, color?: string) => void;
  updateQty: (id: string, qty: number, talla?: number, color?: string) => void;
  clearCart: () => void;
}

export interface ProductoCart {
  id: string;
  slug: string | null;
  nombre: string;
  precio: number;
  precio_descuento: number | null;
  imagen_url: string | null;
}