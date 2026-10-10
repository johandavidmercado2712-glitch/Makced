"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  MAX_IMAGEN_MB,
  PLACEHOLDER_IMAGEN_URL,
  validarImagen,
} from "@/lib/imagenes";
import type { ImagenEstado } from "@/types/components";

interface ImagenSelectorProps {
  prefijo: string;
  urlActual?: string | null;
  keyActual?: string | null;
  /** Texto tras "Imagen quitada " (ej. "del producto", "de la marca") */
  textoQuitada?: string;
  /** Etiqueta del campo (por defecto "Imagen") */
  etiqueta?: string;
  disabled?: boolean;
  onCambio: (estado: ImagenEstado) => void;
  onError: (mensaje: string | null) => void;
}

export function ImagenSelector({
  prefijo,
  urlActual = null,
  keyActual = null,
  textoQuitada = "del producto",
  etiqueta = "Imagen",
  disabled = false,
  onCambio,
  onError,
}: ImagenSelectorProps) {
  const [modo, setModo] = useState<"archivo" | "url">(
    keyActual ? "archivo" : urlActual ? "url" : "archivo",
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [url, setUrl] = useState(urlActual ?? "");
  const [quitar, setQuitar] = useState(false);

  const errorRef = useRef(onError);
  const previewRef = useRef<string | null>(null);

  // sincroniza el callback de error del padre tras cada render
  useEffect(() => {
    errorRef.current = onError;
  });

  // revoca el objectURL al desmontar (el form se remonta al cerrar el modal)
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const reemplazarPreview = (file: File | null) => {
    // Sin side-effects dentro del updater: el ref siempre tiene el valor
    // vigente, así que se revoca y crea fuera, y setPreview recibe el valor directo.
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const siguiente = file ? URL.createObjectURL(file) : null;
    previewRef.current = siguiente;
    setPreview(siguiente);
  };

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fallo = validarImagen(file);
    if (fallo) {
      errorRef.current(fallo);
      e.target.value = "";
      return;
    }

    errorRef.current(null);
    setQuitar(false);
    setArchivo(file);
    reemplazarPreview(file);
    onCambio({ modo, archivo: file, url, quitar: false });
  };

  const cambiarModo = (siguiente: "archivo" | "url") => {
    setModo(siguiente);
    setQuitar(false);
    const siguienteArchivo = siguiente === "url" ? null : archivo;
    if (siguiente === "url") {
      reemplazarPreview(null);
    }
    setArchivo(siguienteArchivo);
    onCambio({ modo: siguiente, archivo: siguienteArchivo, url, quitar: false });
  };

  const previewSrc = quitar
    ? null
    : modo === "archivo"
      ? archivo
        ? preview
        : urlActual
      : url || null;

  const hayImagen = Boolean(urlActual || archivo || url);

  return (
    <div className="db-field db-field-full">
      <label className="db-label" htmlFor={`${prefijo}-imagen`}>{etiqueta}</label>

      <div className="db-img-modes">
        <button
          type="button"
          className={modo === "archivo" ? "active" : ""}
          onClick={() => cambiarModo("archivo")}
          disabled={disabled}
        >
          Subir archivo
        </button>
        <button
          type="button"
          className={modo === "url" ? "active" : ""}
          onClick={() => cambiarModo("url")}
          disabled={disabled}
        >
          Pegar URL
        </button>
      </div>

      {quitar ? (
        <p className="db-img-removed">
          Imagen quitada {textoQuitada}.
          <button
            type="button"
            onClick={() => {
              setQuitar(false);
              onCambio({ modo, archivo, url, quitar: false });
            }}
            disabled={disabled}
          >
            Deshacer
          </button>
        </p>
      ) : modo === "archivo" ? (
        <div className="db-modal-img-row">
          <span
            className="db-modal-img-preview"
            style={
              previewSrc
                ? { backgroundImage: `url(${previewSrc})` }
                : undefined
            }
          />
          <label className="db-file-btn">
            <Upload size={14} />
            {archivo ? "Cambiar archivo" : "Elegir archivo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleArchivo}
              hidden
              disabled={disabled}
            />
          </label>
          <span className="db-file-info">
            {archivo
              ? `${archivo.name} · ${(archivo.size / (1024 * 1024)).toFixed(1)} MB`
              : `JPG, PNG o WebP · máx ${MAX_IMAGEN_MB} MB`}
          </span>
        </div>
      ) : (
        <div className="db-modal-img-row">
          <span
            className="db-modal-img-preview"
            style={
              previewSrc
                ? { backgroundImage: `url(${previewSrc})` }
                : undefined
            }
          />
          <input
            id={`${prefijo}-imagen`}
            name={`${prefijo}-imagen`}
            className="db-input"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setQuitar(false);
              onCambio({ modo, archivo, url: e.target.value, quitar: false });
            }}
            placeholder={PLACEHOLDER_IMAGEN_URL}
            disabled={disabled}
          />
        </div>
      )}

      {!quitar && hayImagen && (
        <button
          type="button"
          className="db-img-remove"
          onClick={() => {
            setQuitar(true);
            setArchivo(null);
            reemplazarPreview(null);
            onCambio({ modo, archivo: null, url, quitar: true });
          }}
          disabled={disabled}
        >
          Quitar imagen
        </button>
      )}

      <input
        type="hidden"
        name={`${prefijo}-imagen-actual-url`}
        value={urlActual ?? ""}
      />
      <input
        type="hidden"
        name={`${prefijo}-imagen-actual-key`}
        value={keyActual ?? ""}
      />
    </div>
  );
}

export default ImagenSelector;
