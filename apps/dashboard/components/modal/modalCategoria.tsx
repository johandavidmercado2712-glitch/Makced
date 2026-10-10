"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { subirImagenEnForm } from "@/lib/imagenes";
import type {
  CategoriaModalData,
  ImagenEstado,
  ModalEntidadProps,
} from "@/types/components";
import { ImagenSelector } from "./ImagenSelector";
import { Modal } from "./Modal";
import { esFallo } from "./modal-utils";

export function ModalCategoria({
  entidad: categoria,
  onSave,
  onDelete,
  trigger,
}: ModalEntidadProps<CategoriaModalData>) {
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
  const esCrear = !categoria?.id;
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
      await subirImagenEnForm(formData, "ck", estado, "categorias");

      setFase("guardando");
      const resultado = await onSave(formData, categoria);
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
            ? "No se pudo crear la categoría"
            : "No se pudieron guardar los cambios",
      );
    }
  };

  const handleEliminar = async () => {
    if (!categoria?.id || !onDelete || ocupado) return;

    const confirmado = window.confirm(
      `¿Eliminar "${categoria.nombre}"?\nEsta acción no se puede deshacer.`,
    );
    if (!confirmado) return;

    setFase("eliminando");
    try {
      const resultado = await onDelete(categoria.id);
      if (esFallo(resultado)) {
        window.alert(resultado.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "No se pudo eliminar la categoría",
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
            aria-label={`Editar ${categoria?.nombre ?? "categoría"}`}
          >
            <Pencil size={16} />
          </button>

          {onDelete && categoria?.id && (
            <button
              type="button"
              className="db-action-btn db-action-delete"
              onClick={handleEliminar}
              disabled={ocupado}
              aria-label={`Eliminar ${categoria.nombre}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

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
        submitLabel={
          fase === "subiendo"
            ? "Subiendo imagen..."
            : fase === "guardando"
              ? esCrear
                ? "Creando..."
                : "Guardando..."
              : esCrear
                ? "Crear categoría"
                : "Guardar cambios"
        }
        onSubmit={handleSubmit}
        idValue={categoria?.id ?? ""}
      />
    </>
  );
}

export default ModalCategoria;
