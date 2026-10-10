import type { ReactNode } from "react";
import type { RefSimple } from "@/types/database";

export interface Option {
  id: string;
  nombre: string;
}

export interface FilterSelectProps {
  icon: string;
  label: string;
  options: Option[];
  paramKey: string;
  defaultValue?: string;
}

export interface ProductoModalData {
  id?: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  precio_descuento?: number | null;
  stock?: number | null;
  imagen_url?: string | null;
  imagen_key?: string | null;
  es_destacado?: boolean | null;
  es_nuevo?: boolean | null;
  estado?: boolean | null;
  marca?: RefSimple | RefSimple[] | null;
  categoria?: RefSimple | RefSimple[] | null;
}

export type GuardadoResultado =
  | { ok: true }
  | { ok: false; error: string };

export type ModalSaveHandler = (
  formData: FormData,
  producto?: ProductoModalData,
) => void | Promise<void | GuardadoResultado>;

export interface ModalProductProps {
  producto?: ProductoModalData;
  marcas?: RefSimple[];
  categorias?: RefSimple[];
  onSave?: ModalSaveHandler;
  onDelete?: (id: string) => Promise<GuardadoResultado>;
  trigger?: ReactNode;
}

export interface ImagenEstado {
  modo: "archivo" | "url";
  archivo: File | null;
  url: string;
  quitar: boolean;
}

export interface MarcaModalData {
  id?: string;
  nombre: string;
  logo_url?: string | null;
  logo_key?: string | null;
  activa?: boolean;
}

export interface CategoriaModalData {
  id?: string;
  nombre: string;
  slug?: string;
  imagen_url?: string | null;
  imagen_key?: string | null;
  activa?: boolean;
}

export type EntidadSaveHandler<T> = (
  formData: FormData,
  entidad?: T,
) => void | Promise<void | GuardadoResultado>;

export interface ModalEntidadProps<T> {
  entidad?: T;
  onSave?: EntidadSaveHandler<T>;
  onDelete?: (id: string) => Promise<GuardadoResultado>;
  trigger?: ReactNode;
}
