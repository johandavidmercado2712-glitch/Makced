"use client";

import { ImagenSelector } from "@/components/modal/ImagenSelector";
import type { EditorDisenoApi } from "./comunes";

export function PanelLogo({ api }: { api: EditorDisenoApi }) {
  const { notificarImagen, setError, version, logoUrl, config } = api;

  return (
    <>
      <ImagenSelector
        key={`lg-${version}`}
        prefijo="lg"
        etiqueta="Logo de la tienda"
        urlActual={logoUrl}
        keyActual={config.logo_key}
        textoQuitada="del logo de la tienda"
        onCambio={(estado) => notificarImagen("lg", estado)}
        onError={setError}
      />
      <p className="de-nota de-grid-full">
        Recomendado: PNG o SVG con fondo transparente, mínimo 200 px de alto.
      </p>
    </>
  );
}
