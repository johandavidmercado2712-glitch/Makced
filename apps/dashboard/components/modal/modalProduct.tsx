"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { subirImagenEnForm } from "@/lib/imagenes";
import type {
  ImagenEstado,
  ModalProductProps,
} from "@/types/components";
import { ImagenSelector } from "./ImagenSelector";
import { Modal } from "./Modal";
import { esFallo } from "./modal-utils";

export type {
  ModalProductProps,
  ProductoModalData,
  GuardadoResultado,
} from "@/types/components";

const pick = <T,>(value: T | T[] | null | undefined): T | undefined =>
  Array.isArray(value) ? value[0] : (value ?? undefined);

export function ModalProduct({
  producto,
  marcas = [],
  categorias = [],
  onSave,
  onDelete,
  trigger,
}: ModalProductProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fase, setFase] = useState<"idle" | "subiendo" | "guardando" | "eliminando">("idle");
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const imagenRef = useRef<ImagenEstado>({
    modo: "archivo",
    archivo: null,
    url: "",
    quitar: false,
  });
  const router = useRouter();
  const marca = pick(producto?.marca);
  const categoria = pick(producto?.categoria);
  const esCrear = !producto?.id;
  const ocupado = fase !== "idle";

  // si la marca/categoría asignada está inactiva, se agrega a las opciones
  // para que el select la muestre (los selectores solo traen activas)
  const opcionesMarcas =
    marca && !marcas.some((m) => m.id === marca.id)
      ? [{ ...marca }, ...marcas]
      : marcas;
  const opcionesCategorias =
    categoria && !categorias.some((c) => c.id === categoria.id)
      ? [{ ...categoria }, ...categorias]
      : categorias;

  const abrir = () => {
    setFase("idle");
    setErrorGuardado(null);
    setIsOpen(true);
  };

  const cerrar = () => {
    setFase("idle");
    setErrorGuardado(null);
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onSave || ocupado) return;

    const formData = new FormData(e.currentTarget);
    const estado = imagenRef.current;

    setErrorGuardado(null);
    try {
      if (estado.modo === "archivo" && estado.archivo && !estado.quitar) {
        setFase("subiendo");
      }
      await subirImagenEnForm(formData, "pm", estado, "productos");

      setFase("guardando");
      const resultado = await onSave(formData, producto);
      if (esFallo(resultado)) {
        setFase("idle");
        setErrorGuardado(resultado.error);
        return;
      }
      cerrar();
      router.refresh();
    } catch (err) {
      setFase("idle");
      setErrorGuardado(
        err instanceof Error
          ? err.message
          : esCrear
            ? "No se pudo crear el producto"
            : "No se pudieron guardar los cambios",
      );
    }
  };

  const handleEliminar = async () => {
    if (!producto?.id || !onDelete || ocupado) return;

    const confirmado = window.confirm(
      `¿Eliminar "${producto.nombre}"?\nEsta acción no se puede deshacer.`,
    );
    if (!confirmado) return;

    setFase("eliminando");
    try {
      const resultado = await onDelete(producto.id);
      if (esFallo(resultado)) {
        window.alert(resultado.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "No se pudo eliminar el producto",
      );
    } finally {
      setFase("idle");
    }
  };

  return (
    <>
      {trigger ? (
        <button
          type="button"
          className="db-btn-primary db-modal-trigger"
          onClick={abrir}
        >
          {trigger}
        </button>
      ) : (
        <div className="db-actions">
          <button
            type="button"
            className="db-action-btn"
            onClick={abrir}
            aria-label={`Editar ${producto?.nombre ?? "producto"}`}
          >
            <Pencil size={16} />
          </button>

          {onDelete && producto?.id && (
            <button
              type="button"
              className="db-action-btn db-action-delete"
              onClick={handleEliminar}
              disabled={ocupado}
              aria-label={`Eliminar ${producto.nombre}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={cerrar}
        title={esCrear ? "Nuevo producto" : "Editar producto"}
        subtitle={
          esCrear
            ? "Añade un producto al catálogo"
            : "Actualiza la información del catálogo"
        }
        body={
          <>
            <div className="db-field db-field-full">
              <label className="db-label" htmlFor="pm-nombre">
                Nombre del producto
              </label>
              <input
                id="pm-nombre"
                name="pm-nombre"
                className="db-input"
                type="text"
                required
                defaultValue={producto?.nombre ?? ""}
                placeholder="Ej. Zapatillas Nike Air Max 270"
              />
            </div>

            <ImagenSelector
              prefijo="pm"
              urlActual={producto?.imagen_url}
              keyActual={producto?.imagen_key}
              textoQuitada="del producto"
              disabled={ocupado}
              onCambio={(estado) => {
                imagenRef.current = estado;
              }}
              onError={setErrorGuardado}
            />

            <div className="db-field">
              <label className="db-label" htmlFor="pm-marca">
                Marca
              </label>
              <select
                id="pm-marca"
                name="pm-marca"
                className="db-select"
                defaultValue={marca?.id ?? ""}
              >
                <option value="">Seleccionar marca</option>
                {opcionesMarcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="db-field">
              <label className="db-label" htmlFor="pm-categoria">
                Categoría
              </label>
              <select
                id="pm-categoria"
                name="pm-categoria"
                className="db-select"
                defaultValue={categoria?.id ?? ""}
              >
                <option value="">Seleccionar categoría</option>
                {opcionesCategorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="db-field">
              <label className="db-label" htmlFor="pm-precio">
                Precio
              </label>
              <input
                id="pm-precio"
                name="pm-precio"
                className="db-input"
                type="number"
                min="0"
                step="1000"
                required
                defaultValue={producto?.precio ?? ""}
                placeholder="0"
              />
            </div>

            <div className="db-field">
              <label className="db-label" htmlFor="pm-descuento">
                Precio con descuento
              </label>
              <input
                id="pm-descuento"
                name="pm-descuento"
                className="db-input"
                type="number"
                min="0"
                step="1000"
                defaultValue={producto?.precio_descuento ?? ""}
                placeholder="Sin descuento"
              />
            </div>

            <div className="db-field">
              <label className="db-label" htmlFor="pm-stock">
                Stock
              </label>
              <input
                id="pm-stock"
                name="pm-stock"
                className="db-input"
                type="number"
                min="0"
                defaultValue={producto?.stock ?? ""}
                placeholder="0"
              />
            </div>

            <div className="db-field">
              <label className="db-label" htmlFor="pm-estado">
                Estado
              </label>
              <select
                id="pm-estado"
                name="pm-estado"
                className="db-select"
                defaultValue={producto?.estado === false ? "false" : "true"}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            <div className="db-field db-field-full">
              <label className="db-label" htmlFor="pm-descripcion">
                Descripción
              </label>
              <textarea
                id="pm-descripcion"
                name="pm-descripcion"
                className="db-textarea"
                defaultValue={producto?.descripcion ?? ""}
                placeholder="Describe el producto..."
              />
            </div>

            <div className="db-modal-switches">
              <label className="db-switch">
                <input
                  type="checkbox"
                  name="es_destacado"
                  value="true"
                  defaultChecked={producto?.es_destacado ?? false}
                />
                <span className="db-switch-track" />
                Destacado
              </label>
              <label className="db-switch">
                <input
                  type="checkbox"
                  name="es_nuevo"
                  value="true"
                  defaultChecked={producto?.es_nuevo ?? false}
                />
                <span className="db-switch-track" />
                Nuevo
              </label>
            </div>
          </>
        }
        errorGuardado={errorGuardado}
        ocupado={ocupado}
        submitLabel={
          fase === "subiendo"
            ? "Subiendo imagen..."
            : fase === "guardando"
              ? esCrear
                ? "Creando..."
                : "Guardando..."
              : esCrear
                ? "Crear producto"
                : "Guardar cambios"
        }
        onSubmit={handleSubmit}
        idValue={producto?.id ?? ""}
      />
    </>
  );
}

export default ModalProduct;
