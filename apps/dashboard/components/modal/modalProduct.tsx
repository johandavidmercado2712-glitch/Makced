"use client";

import type { ModalProductProps, ProductoModalData, GuardadoResultado } from "@/types/components";
import { ImagenSelector } from "./ImagenSelector";
import { Modal } from "./Modal";
import { ModalAcciones } from "./ModalAcciones";
import { Tooltip } from "@/components/Tooltip";
import { etiquetaSubmit } from "./modal-utils";
import { useModalCrud } from "./useModalCrud";
import { ConfirmModal } from "./ConfirmModal";

const pick = <T,>(value: T | T[] | null | undefined): T | undefined =>
  Array.isArray(value) ? value[0] : (value ?? undefined);

// si la marca/categoría asignada está inactiva, se agrega a las opciones
// para que el select la muestre (los selectores solo traen activas)
const opcionesConInactiva = <T extends { id: string }>(
  actual: T | undefined,
  lista: T[],
): T[] => (actual && !lista.some((o) => o.id === actual.id) ? [{ ...actual }, ...lista] : lista);

function SelectOpciones({
  id,
  etiqueta,
  placeholder,
  opciones,
  actual,
}: {
  id: string;
  etiqueta: string;
  placeholder: string;
  opciones: { id: string; nombre: string }[];
  actual?: { id: string };
}) {
  return (
    <div className="db-field">
      <label className="db-label" htmlFor={id}>
        {etiqueta}
      </label>
      <select id={id} name={id} className="db-select" defaultValue={actual?.id ?? ""}>
        <option value="">{placeholder}</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ModalProduct({
  producto,
  marcas = [],
  categorias = [],
  onSave,
  onDelete,
  trigger,
  triggerId,
}: ModalProductProps) {
  const {
    isOpen,
    fase,
    errorGuardado,
    imagenRef,
    esCrear,
    ocupado,
    id,
    nombre,
    abrir,
    cerrar,
    handleSubmit,
    handleEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    mostrarConfirmEliminar,
    setErrorGuardado,
  } = useModalCrud({
    entidad: producto,
    prefijo: "pm",
    carpeta: "productos",
    mensajes: {
      crear: "No se pudo crear el producto",
      editar: "No se pudieron guardar los cambios",
      eliminar: "No se pudo eliminar el producto",
    },
    onSave,
    onDelete,
  });

  const marca = pick(producto?.marca);
  const categoria = pick(producto?.categoria);
  const opcionesMarcas = opcionesConInactiva(marca, marcas);
  const opcionesCategorias = opcionesConInactiva(categoria, categorias);

  return (
    <>
      <ModalAcciones
        trigger={trigger}
        triggerId={triggerId}
        onAbrir={abrir}
        onEliminar={handleEliminar}
        puedeEliminar={Boolean(onDelete && id)}
        ocupado={ocupado}
        editarLabel={`Editar ${nombre || "producto"}`}
        eliminarLabel={`Eliminar ${nombre}`}
      />

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
                Nombre del producto<span className="db-label-required" aria-label="obligatorio">*</span>
              </label>
              <input
                id="pm-nombre"
                name="pm-nombre"
                className="db-input"
                type="text"
                required
                defaultValue={producto?.nombre ?? ""}
                placeholder="Ej: Tenis Nike Air Max 270"
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

            <SelectOpciones
              id="pm-marca"
              etiqueta="Marca"
              placeholder="Seleccionar marca"
              opciones={opcionesMarcas}
              actual={marca}
            />

            <SelectOpciones
              id="pm-categoria"
              etiqueta="Categoría"
              placeholder="Seleccionar categoría"
              opciones={opcionesCategorias}
              actual={categoria}
            />

            <div className="db-field">
              <label className="db-label" htmlFor="pm-precio">
                Precio<span className="db-label-required" aria-label="obligatorio">*</span>
                <Tooltip contenido="El precio se muestra en la tienda. Usa numeros enteros, sin decimales." />
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
                <Tooltip contenido="Los productos activos se muestran en la tienda. Los inactivos solo aparecen en el panel." />
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
                <Tooltip contenido="Aparece en la portada de la tienda y en el carrusel principal." />
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
                <Tooltip contenido="Muestra la etiqueta 'Nuevo' en la tarjeta del producto." />
              </label>
            </div>
          </>
        }
        errorGuardado={errorGuardado}
        ocupado={ocupado}
        submitLabel={etiquetaSubmit(fase, esCrear, "producto")}
        onSubmit={handleSubmit}
        idValue={id ?? ""}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        titulo="Eliminar producto"
        mensaje={`¿Estás seguro de que quieres eliminar el producto "${nombre}"?`}
        onConfirm={handleConfirmEliminar}
        onCancel={handleCancelEliminar}
        mostrar={mostrarConfirmEliminar}
      />
    </>
  );
}

export type { ModalProductProps, ProductoModalData, GuardadoResultado };
