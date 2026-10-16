"use client";

import { Image as ImageIcon } from "lucide-react";
import {
  SLIDES_BANNER,
  imagenVista,
  urlImagen,
  type EditorDisenoApi,
} from "./comunes";

const renderImagen = (src: string | null, alt: string) =>
  src ? (
    <img src={urlImagen(src)} alt={alt} />
  ) : (
    <span className="de-prev-fallback">
      <ImageIcon size={16} />
    </span>
  );

const SECCIONES_PROMO = ["promo", "newsletter"] as const;

export function PrevEstilo({ api }: { api: EditorDisenoApi }) {
  const { colorP, borrador } = api;
  return (
    <div className="de-prev-estilo">
      <div className="de-prev-fila">
        <span className="de-prev-boton">Comprar</span>
        <span className="de-prev-enlace">Ver catálogo</span>
      </div>
      <div className="de-prev-tarjeta">
        <div className="de-prev-img" />
        <strong>Zapatilla urbana</strong>
        <span className="de-prev-precio">$ 189.900</span>
      </div>
      <div className="de-prev-swatches">
        <span style={{ background: colorP }} />
        <span style={{ background: borrador.color_secundario }} />
        <em>
          {colorP} · {borrador.color_secundario} · {borrador.radio}px ·{" "}
          {borrador.tipografia}
        </em>
      </div>
    </div>
  );
}

export function PrevLogo({ api }: { api: EditorDisenoApi }) {
  const { imagenes, logoUrl, borrador } = api;
  const logoVista = imagenVista(imagenes, "lg", logoUrl);
  return (
    <div className="de-prev-navmock">
      {logoVista ? (
        <img className="de-prev-logo" src={urlImagen(logoVista)} alt="Logo de la tienda" />
      ) : (
        <strong className="de-prev-marca">{borrador.pie.marca}</strong>
      )}
      <nav className="de-prev-nav">
        <span>Inicio</span>
        <span>Catálogo</span>
        <span>Contacto</span>
      </nav>
    </div>
  );
}

export function PrevBanner({ api }: { api: EditorDisenoApi }) {
  const { borrador, config, imagenes } = api;
  return (
    <div className="de-prev-banner">
      {SLIDES_BANNER.map(({ slideKey, pos }) => {
        const slide = borrador.banner.slides[pos];
        return (
          <div className="de-prev-slide" key={slideKey}>
            <span className="de-prev-slide-img">
              {renderImagen(
                imagenVista(imagenes, `bn${pos}`, config.banner.slides[pos].imagen || null),
                slide.palabra || `Slide ${pos + 1}`,
              )}
            </span>
            <div className="de-prev-slide-txt">
              <strong>{slide.palabra || `Slide ${pos + 1}`}</strong>
              <p>{slide.parrafo}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PrevPromo({ api }: { api: EditorDisenoApi }) {
  const { borrador, imagenes } = api;
  return (
    <div className="de-prev-doble">
      {SECCIONES_PROMO.map((seccion) => (
        <div className="de-prev-mini" key={seccion}>
          <span className="de-prev-mini-img">
            {renderImagen(
              imagenVista(
                imagenes,
                seccion === "promo" ? "pr" : "nl",
                borrador[seccion].imagen || null,
              ),
              borrador[seccion].titulo,
            )}
          </span>
          <strong>{borrador[seccion].titulo}</strong>
          <p>{borrador[seccion].descripcion}</p>
          <span className="de-prev-boton-chico">{borrador[seccion].boton}</span>
        </div>
      ))}
    </div>
  );
}

export function PrevTitulos({ api }: { api: EditorDisenoApi }) {
  const { borrador } = api;
  return (
    <div className="de-prev-titulos">
      <h1 className="de-prev-h1">{borrador.titulos.categorias}</h1>
      <span className="de-prev-linea" />
      <h1 className="de-prev-h1">{borrador.titulos.productos}</h1>
    </div>
  );
}

export function PrevPie({ api }: { api: EditorDisenoApi }) {
  const { borrador } = api;
  return (
    <div className="de-prev-pie">
      <strong>{borrador.pie.marca}</strong>
      <span>
        © {new Date().getFullYear()} {borrador.pie.marca}. {borrador.pie.copyright}
      </span>
      <span className="de-prev-pie-mensaje">{borrador.pie.mensaje}</span>
    </div>
  );
}
