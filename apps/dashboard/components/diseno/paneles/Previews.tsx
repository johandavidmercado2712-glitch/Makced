"use client";

// Los borradores de diseño pueden contener previews `blob:` antes de subirse:
// `next/image` no acepta `blob:` y rompería el panel de estilo.
/* eslint-disable @next/next/no-img-element */

import { Image as ImageIcon } from "lucide-react";
import { esEnlacePieVisible } from "@makced/db/diseno";
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
  const { colorP, borrador, productoVistaPrevia } = api;
  return (
    <div className="de-prev-estilo">
      <div className="de-prev-fila">
        <span className="de-prev-boton">Comprar</span>
        <span className="de-prev-enlace">Ver catálogo</span>
      </div>
      <div className="de-prev-tarjeta">
        {productoVistaPrevia ? (
          <>
            <div className="de-prev-img">
              {renderImagen(productoVistaPrevia.imagenUrl, productoVistaPrevia.nombre)}
            </div>
            <strong>{productoVistaPrevia.nombre}</strong>
            {borrador.mostrar_precios !== false && (
              <span className="de-prev-precio">
                $ {productoVistaPrevia.precio.toLocaleString("es-CO")}
              </span>
            )}
          </>
        ) : (
          <div className="de-prev-vacio">
            <ImageIcon size={18} aria-hidden="true" />
            <span>Destaca un producto para ver la vista previa.</span>
          </div>
        )}
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
  const { pie } = borrador;
  const informacion = pie.informacion.filter(esEnlacePieVisible);
  const ayuda = pie.ayuda.filter(esEnlacePieVisible);
  const redes = [
    pie.web_url && "Sitio web",
    pie.instagram_url && "Instagram",
    pie.whatsapp_url && "WhatsApp",
  ].filter(Boolean);

  return (
    <div className="de-prev-pie">
      <strong>{pie.marca}</strong>

      {(informacion.length > 0 || ayuda.length > 0) && (
        <div className="de-prev-pie-cols">
          {informacion.length > 0 && (
            <div>
              <em>{pie.titulo_informacion}</em>
              {informacion.map((enlace) => (
                <span key={`info-${enlace.etiqueta}-${enlace.url}`}>
                  {enlace.etiqueta}
                </span>
              ))}
            </div>
          )}
          {ayuda.length > 0 && (
            <div>
              <em>{pie.titulo_ayuda}</em>
              {ayuda.map((enlace) => (
                <span key={`ayuda-${enlace.etiqueta}-${enlace.url}`}>
                  {enlace.etiqueta}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {redes.length > 0 && (
        <div className="de-prev-pie-redes">{redes.join(" · ")}</div>
      )}

      <span>
        © {new Date().getFullYear()} {pie.marca}. {pie.copyright}
      </span>
      <span className="de-prev-pie-mensaje">{pie.mensaje}</span>
    </div>
  );
}
