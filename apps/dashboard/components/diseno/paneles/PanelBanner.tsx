"use client";

import { ImagenSelector } from "@/components/modal/ImagenSelector";
import { SLIDES_BANNER, type EditorDisenoApi } from "./comunes";
import { Contador } from "./Contador";

export function PanelBanner({ api }: { api: EditorDisenoApi }) {
  const { borrador, config, setSlide, notificarImagen, setError, version } = api;

  return (
    <>
      {SLIDES_BANNER.map(({ slideKey, pos }) => {
        const slide = borrador.banner.slides[pos];
        return (
          <div className="de-tarjeta de-grid-full" key={slideKey}>
            <div className="de-tarjeta-head">
              <strong>Slide {pos + 1}</strong>
              <span>se rota en el hero de tu página de inicio</span>
            </div>
            <div className="de-tarjeta-campos">
              <div className="db-field db-field-full">
                <label className="db-label" htmlFor={`bn${pos}-palabra`}>
                  Palabra
                </label>
                <input
                  id={`bn${pos}-palabra`}
                  name={`bn${pos}-palabra`}
                  className="db-input"
                  required
                  maxLength={40}
                  placeholder="Ej. NUEVA COLECCIÓN"
                  value={slide.palabra}
                  onChange={(e) => setSlide(pos, "palabra", e.target.value)}
                />
                <Contador actual={slide.palabra.length} max={40} />
              </div>
              <div className="db-field db-field-full">
                <label className="db-label" htmlFor={`bn${pos}-parrafo`}>
                  Párrafo
                </label>
                <textarea
                  id={`bn${pos}-parrafo`}
                  name={`bn${pos}-parrafo`}
                  className="db-textarea"
                  maxLength={220}
                  placeholder="Texto corto que acompaña al título (opcional)…"
                  value={slide.parrafo}
                  onChange={(e) => setSlide(pos, "parrafo", e.target.value)}
                />
                <Contador actual={slide.parrafo.length} max={220} />
              </div>
              <ImagenSelector
                key={`bn${pos}-${version}`}
                prefijo={`bn${pos}`}
                etiqueta={`Imagen del slide ${pos + 1}`}
                urlActual={config.banner.slides[pos].imagen || null}
                keyActual={config.banner.slides[pos].imagen_key}
                textoQuitada={`del slide ${pos + 1}`}
                onCambio={(estado) => notificarImagen(`bn${pos}`, estado)}
                onError={setError}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
