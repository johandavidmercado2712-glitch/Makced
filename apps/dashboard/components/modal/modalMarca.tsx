"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { subirImagenEnForm } from "@/lib/imagenes";
import type {
  ImagenEstado,
  MarcaModalData,
  ModalEntidadProps,
} from "@/types/components";
import { ImagenSelector } from "./ImagenSelector";
import { Modal } from "./Modal";
import { esFallo } from "./modal-utils";

export function ModalMarca({
  entidad: marca,
  onSave,
  onDelete,
  trigger,
}: ModalEntidadProps<MarcaModalData>) {
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
  const esCrear = !marca?.id;
  const ocupado = fase !== "idle";

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
      await subirImagenEnForm(formData, "mk", estado, "marcas");

      setFase("guardando");
      const resultado = await onSave(formData, marca);
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
            ? "No se pudo crear la marca"
            : "No se pudieron guardar los cambios",
      );
    }
  };

  const handleEliminar = async () => {
    if (!marca?.id || !onDelete || ocupado) return;

    const confirmado = window.confirm(
      `¿Eliminar "${marca.nombre}"?\nEsta acción no se puede deshacer.`,
    );
    if (!confirmado) return;

    setFase("eliminando");
    try {
      const resultado = await onDelete(marca.id);
      if (esFallo(resultado)) {
        window.alert(resultado.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "No se pudo eliminar la marca",
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
            aria-label={`Editar ${marca?.nombre ?? "marca"}`}
          >
            <Pencil size={16} />
          </button>

          {onDelete && marca?.id && (
            <button
              type="button"
              className="db-action-btn db-action-delete"
              onClick={handleEliminar}
              disabled={ocupado}
              aria-label={`Eliminar ${marca.nombre}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

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
        submitLabel={
          fase === "subiendo"
            ? "Subiendo imagen..."
            : fase === "guardando"
              ? esCrear
                ? "Creando..."
                : "Guardando..."
              : esCrear
                ? "Crear marca"
                : "Guardar cambios"
        }
        onSubmit={handleSubmit}
        idValue={marca?.id ?? ""}
      />
    </>
  );
}

export default ModalMarca;
