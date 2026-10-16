"use client";

import type { MarcaModalData, ModalEntidadProps } from "@/types/components";
import { ImagenSelector } from "./ImagenSelector";
import { Modal } from "./Modal";
import { ModalAcciones } from "./ModalAcciones";
import { etiquetaSubmit } from "./modal-utils";
import { useModalCrud } from "./useModalCrud";

export function ModalMarca({
  entidad: marca,
  onSave,
  onDelete,
  trigger,
}: ModalEntidadProps<MarcaModalData>) {
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
  } = useModalCrud<MarcaModalData>({
    entidad: marca,
    prefijo: "mk",
    carpeta: "marcas",
    mensajes: {
      crear: "No se pudo crear la marca",
      editar: "No se pudieron guardar los cambios",
      eliminar: "No se pudo eliminar la marca",
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
        editarLabel={`Editar ${nombre || "marca"}`}
        eliminarLabel={`Eliminar ${nombre}`}
      />

      <Modal
        isOpen={isOpen}
        onClose={cerrar}
        title={esCrear ? "Nueva marca" : "Editar marca"}
        subtitle={
          esCrear
            ? "Añade una marca a la tienda"
            : "Actualiza los datos de la marca"
        }
        body={
          <>
            <div className="db-field db-field-full">
              <label className="db-label" htmlFor="mk-nombre">
                Nombre de la marca
              </label>
              <input
                id="mk-nombre"
                name="mk-nombre"
                className="db-input"
                type="text"
                required
                defaultValue={marca?.nombre ?? ""}
                placeholder="Ej. Nike"
              />
            </div>

            <ImagenSelector
              prefijo="mk"
              urlActual={marca?.logo_url}
              keyActual={marca?.logo_key}
              textoQuitada="de la marca"
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
                  defaultChecked={marca?.activa ?? true}
                />
                <span className="db-switch-track" />
                Activa (visible en la tienda)
              </label>
            </div>
          </>
        }
        errorGuardado={errorGuardado}
        ocupado={ocupado}
        submitLabel={etiquetaSubmit(fase, esCrear, "marca")}
        onSubmit={handleSubmit}
        idValue={id ?? ""}
      />
    </>
  );
}

export default ModalMarca;
