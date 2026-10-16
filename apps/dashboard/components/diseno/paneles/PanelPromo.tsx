"use client";

import { ImagenSelector } from "@/components/modal/ImagenSelector";
import type { EditorDisenoApi } from "./comunes";
import { Contador } from "./Contador";

const SECCIONES = ["promo", "newsletter"] as const;

export function PanelPromo({ api }: { api: EditorDisenoApi }) {
  const { borrador, setBanner, notificarImagen, setError, version } = api;

  return (
    <>
      {SECCIONES.map((seccion) => (
        <div className="de-tarjeta de-grid-full" key={seccion}>
          <div className="de-tarjeta-head">
            <strong>
              {seccion === "promo" ? "Banner de colección" : "Banner de newsletter"}
            </strong>
            <span>
              {seccion === "promo"
                ? "aparece debajo de la sección CATEGORIAS"
                : "cierra la página de inicio, antes del pie"}
            </span>
          </div>
          <div className="de-tarjeta-campos">
            <div className="db-field">
              <label className="db-label" htmlFor={`${seccion}-titulo`}>
                Título
              </label>
              <input
                id={`${seccion}-titulo`}
                name={`${seccion}-titulo`}
                className="db-input"
                required
                maxLength={60}
                placeholder={seccion === "promo" ? "Ej. 2x1 en tenis" : "Ej. ¡Únete a la lista!"}
                value={borrador[seccion].titulo}
                onChange={(e) => setBanner(seccion, "titulo", e.target.value)}
              />
              <Contador actual={borrador[seccion].titulo.length} max={60} />
            </div>
            <div className="db-field">
              <label className="db-label" htmlFor={`${seccion}-boton`}>
                Texto del botón
              </label>
              <input
                id={`${seccion}-boton`}
                name={`${seccion}-boton`}
                className="db-input"
                required
                maxLength={40}
                placeholder="Ej. Comprar ahora"
                value={borrador[seccion].boton}
                onChange={(e) => setBanner(seccion, "boton", e.target.value)}
              />
              <Contador actual={borrador[seccion].boton.length} max={40} />
            </div>
            <div className="db-field db-field-full">
              <label className="db-label" htmlFor={`${seccion}-descripcion`}>
                Descripción
              </label>
              <textarea
                id={`${seccion}-descripcion`}
                name={`${seccion}-descripcion`}
                className="db-textarea"
                maxLength={220}
                placeholder="Descripción breve del banner (opcional)…"
                value={borrador[seccion].descripcion}
                onChange={(e) =>
                  setBanner(seccion, "descripcion", e.target.value)
                }
              />
              <Contador actual={borrador[seccion].descripcion.length} max={220} />
            </div>
            <div className="db-field db-field-full">
              <label className="db-label" htmlFor={`${seccion}-link`}>
                Enlace del botón
              </label>
              <input
                id={`${seccion}-link`}
                name={`${seccion}-link`}
                className="db-input"
                maxLength={200}
                placeholder="/catalogo, https://…"
                value={borrador[seccion].link}
                onChange={(e) => setBanner(seccion, "link", e.target.value)}
              />
              <Contador actual={borrador[seccion].link.length} max={200} />
            </div>
            <ImagenSelector
              key={`${seccion === "promo" ? "pr" : "nl"}-${version}`}
              prefijo={seccion === "promo" ? "pr" : "nl"}
              etiqueta="Imagen de fondo"
              urlActual={borrador[seccion].imagen || null}
              keyActual={borrador[seccion].imagen_key}
              textoQuitada={
                seccion === "promo"
                  ? "del banner de colección"
                  : "del banner de newsletter"
              }
              onCambio={(estado) =>
                notificarImagen(seccion === "promo" ? "pr" : "nl", estado)
              }
              onError={setError}
            />
          </div>
        </div>
      ))}
    </>
  );
}
