"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  MAX_IMAGEN_MB,
  PLACEHOLDER_IMAGEN_URL,
  validarImagen,
  urlImagen,
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

const modoInicial = (keyActual: string | null, urlActual: string | null): "archivo" | "url" =>
  keyActual ? "archivo" : urlActual ? "url" : "archivo";

const calcularPreviewSrc = (
  quitar: boolean,
  modo: "archivo" | "url",
  archivo: File | null,
  preview: string | null,
  urlActual: string | null,
  url: string,
): string | null => {
  if (quitar) return null;
  // Solo la preview se resuelve contra la tienda (rutas relativas guardadas);
  // el valor crudo del input/estado se mantiene sin tocar.
  if (modo === "archivo") return archivo ? preview : urlActual ? urlImagen(urlActual) : null;
  return url ? urlImagen(url) : null;
};

function ImagenVistaModo({
  quitar,
  modo,
  archivo,
  previewSrc,
  textoQuitada,
  prefijo,
  url,
  disabled,
  onDeshacer,
  onCambioUrl,
  onArchivoChange,
}: {
  quitar: boolean;
  modo: "archivo" | "url";
  archivo: File | null;
  previewSrc: string | null;
  textoQuitada: string;
  prefijo: string;
  url: string;
  disabled: boolean;
  onDeshacer: () => void;
  onCambioUrl: (valor: string) => void;
  onArchivoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const estiloPreview = previewSrc
    ? { backgroundImage: `url(${previewSrc})` }
    : undefined;

  if (quitar) {
    return (
      <p className="db-img-removed">
        Imagen quitada {textoQuitada}.
        <button type="button" onClick={onDeshacer} disabled={disabled}>
          Deshacer
        </button>
      </p>
    );
  }

  if (modo === "archivo") {
    return (
      <div className="db-modal-img-row">
        <span className="db-modal-img-preview" style={estiloPreview} />
        <label className="db-file-btn">
          <Upload size={14} />
          {archivo ? "Cambiar archivo" : "Elegir archivo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onArchivoChange}
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
    );
  }

  return (
    <div className="db-modal-img-row">
      <span className="db-modal-img-preview" style={estiloPreview} />
      <input
        id={`${prefijo}-imagen`}
        name={`${prefijo}-imagen`}
        className="db-input"
        type="url"
        value={url}
        onChange={(e) => onCambioUrl(e.target.value)}
        placeholder={PLACEHOLDER_IMAGEN_URL}
        disabled={disabled}
      />
    </div>
  );
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
    () => modoInicial(keyActual, urlActual),
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

  const previewSrc = calcularPreviewSrc(quitar, modo, archivo, preview, urlActual, url);
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

      <ImagenVistaModo
        quitar={quitar}
        modo={modo}
        archivo={archivo}
        previewSrc={previewSrc}
        textoQuitada={textoQuitada}
        prefijo={prefijo}
        url={url}
        disabled={disabled}
        onDeshacer={() => {
          setQuitar(false);
          onCambio({ modo, archivo, url, quitar: false });
        }}
        onCambioUrl={(valor) => {
          setUrl(valor);
          setQuitar(false);
          onCambio({ modo, archivo, url: valor, quitar: false });
        }}
        onArchivoChange={handleArchivo}
      />

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
