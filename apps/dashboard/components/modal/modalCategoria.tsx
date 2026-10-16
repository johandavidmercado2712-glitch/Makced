"use client";

import type { CategoriaModalData, ModalEntidadProps } from "@/types/components";
import { ImagenSelector } from "./ImagenSelector";
import { Modal } from "./Modal";
import { ModalAcciones } from "./ModalAcciones";
import { etiquetaSubmit } from "./modal-utils";
import { useModalCrud } from "./useModalCrud";

export function ModalCategoria({
  entidad: categoria,
  onSave,
  onDelete,
  trigger,
}: ModalEntidadProps<CategoriaModalData>) {
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
    setErrorGuardado,
  } = useModalCrud<CategoriaModalData>({
    entidad: categoria,
    prefijo: "ck",
    carpeta: "categorias",
    mensajes: {
      crear: "No se pudo crear la categoría",
      editar: "No se pudieron guardar los cambios",
      eliminar: "No se pudo eliminar la categoría",
    },
    onSave,
    onDelete,
  });

  return (
    <>
      <ModalAcciones
        trigger={trigger}
        onAbrir={abrir}
        onEliminar={handleEliminar}
        puedeEliminar={Boolean(onDelete && id)}
        ocupado={ocupado}
        editarLabel={`Editar ${nombre || "categoría"}`}
        eliminarLabel={`Eliminar ${nombre}`}
      />

      <Modal
        isOpen={isOpen}
        onClose={cerrar}
        title={esCrear ? "Nueva categoría" : "Editar categoría"}
        subtitle={
          esCrear
            ? "Añade una categoría a la tienda"
            : "Actualiza los datos de la categoría"
        }
        body={
          <>
            <div className="db-field db-field-full">
              <label className="db-label" htmlFor="ck-nombre">
                Nombre de la categoría
              </label>
              <input
                id="ck-nombre"
                name="ck-nombre"
                className="db-input"
                type="text"
                required
                defaultValue={categoria?.nombre ?? ""}
                placeholder="Ej. Zapatillas"
              />
              {categoria?.slug && (
                <p className="db-file-info" style={{ marginTop: 6 }}>
                  Slug: {categoria.slug} (se mantiene al editar)
                </p>
              )}
            </div>

            <ImagenSelector
              prefijo="ck"
              urlActual={categoria?.imagen_url}
              keyActual={categoria?.imagen_key}
              textoQuitada="de la categoría"
              disabled={ocupado}
              onCambio={(estado) => {
                imagenRef.current = estado;
              }}
              onError={setErrorGuardado}
            />

            <div className="db-modal-switches">
              <label className="db-switch">
                <input
                  type="checkbox"
                  name="activa"
                  value="true"
                  defaultChecked={categoria?.activa ?? true}
                />
                <span className="db-switch-track" />
                Activa (visible en la tienda)
              </label>
            </div>
          </>
        }
        errorGuardado={errorGuardado}
        ocupado={ocupado}
        submitLabel={etiquetaSubmit(fase, esCrear, "categoría")}
        onSubmit={handleSubmit}
        idValue={id ?? ""}
      />
    </>
  );
}

export default ModalCategoria;
