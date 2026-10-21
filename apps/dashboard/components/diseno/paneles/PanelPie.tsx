"use client";

import { AlertCircle, Plus, Trash2 } from "lucide-react";
import {
  MAX_ENLACES_PIE,
  esUrlPieValida,
  type EnlacePie,
} from "@makced/db/diseno";
import type {
  CampoTextoPie,
  EditorDisenoApi,
  SeccionEnlacesPie,
} from "./comunes";
import { Contador } from "./Contador";

function CampoUrl({
  id,
  name,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (valor: string) => void;
}) {
  const invalida = value.trim().length > 0 && !esUrlPieValida(value);
  return (
    <div className="db-field">
      <label className="db-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        className="db-input"
        maxLength={200}
        placeholder={placeholder}
        value={value}
        aria-invalid={invalida}
        onChange={(e) => onChange(e.target.value)}
      />
      {invalida && (
        <span className="de-enlace-error">
          <AlertCircle size={12} /> Usá https://, mailto:, tel: o una ruta /...
        </span>
      )}
    </div>
  );
}

function EditorEnlaces({
  api,
  seccion,
  titulo,
  tituloCampo,
}: {
  api: EditorDisenoApi;
  seccion: SeccionEnlacesPie;
  titulo: string;
  tituloCampo: "titulo_informacion" | "titulo_ayuda";
}) {
  const {
    borrador,
    setPie,
    setEnlacePie,
    agregarEnlacePie,
    quitarEnlacePie,
  } = api;
  const enlaces = borrador.pie[seccion];

  return (
    <div className="de-tarjeta de-grid-full">
      <div className="de-tarjeta-head">
        <strong>{titulo}</strong>
        <span>
          {enlaces.length}/{MAX_ENLACES_PIE}
        </span>
      </div>

      <div className="db-field">
        <label className="db-label" htmlFor={`de-pie-${seccion}-titulo`}>
          Título de la columna
        </label>
        <input
          id={`de-pie-${seccion}-titulo`}
          name={`pie-${tituloCampo}`}
          className="db-input"
          maxLength={40}
          placeholder={seccion === "informacion" ? "INFORMACIÓN" : "AYUDA"}
          value={borrador.pie[tituloCampo]}
          onChange={(e) => setPie(tituloCampo, e.target.value)}
        />
        <Contador actual={borrador.pie[tituloCampo].length} max={40} />
      </div>

      <div className="de-enlaces">
        {enlaces.map((enlace: EnlacePie, indice: number) => (
          <div className="de-enlace-fila" key={`${seccion}-${indice}`}>
            <div className="db-field">
              <label
                className="db-label"
                htmlFor={`de-pie-${seccion}-${indice}-etiqueta`}
              >
                Etiqueta
              </label>
              <input
                id={`de-pie-${seccion}-${indice}-etiqueta`}
                className="db-input"
                maxLength={40}
                placeholder="Ej. Nosotros"
                value={enlace.etiqueta}
                onChange={(e) =>
                  setEnlacePie(seccion, indice, "etiqueta", e.target.value)
                }
              />
            </div>
            <div className="db-field">
              <label
                className="db-label"
                htmlFor={`de-pie-${seccion}-${indice}-url`}
              >
                URL
              </label>
              <input
                id={`de-pie-${seccion}-${indice}-url`}
                className="db-input"
                maxLength={200}
                placeholder="/nosotros o https://..."
                value={enlace.url}
                aria-invalid={
                  enlace.url.trim().length > 0 && !esUrlPieValida(enlace.url)
                }
                onChange={(e) =>
                  setEnlacePie(seccion, indice, "url", e.target.value)
                }
              />
              {enlace.url.trim().length > 0 && !esUrlPieValida(enlace.url) && (
                <span className="de-enlace-error">
                  <AlertCircle size={12} /> URL no válida
                </span>
              )}
            </div>
            <button
              type="button"
              className="de-enlace-quitar"
              onClick={() => quitarEnlacePie(seccion, indice)}
              aria-label={`Quitar ${enlace.etiqueta || "enlace"}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="de-enlaces-acciones">
        <button
          type="button"
          className="de-agregar-enlace"
          onClick={() => agregarEnlacePie(seccion)}
          disabled={enlaces.length >= MAX_ENLACES_PIE}
        >
          <Plus size={14} /> Agregar enlace
        </button>
        <span className="de-nota">
          Los enlaces con URL vacía no se muestran en la tienda.
        </span>
      </div>

      <input
        type="hidden"
        name={`pie-${seccion}`}
        value={JSON.stringify(enlaces)}
      />
    </div>
  );
}

export function PanelPie({ api }: { api: EditorDisenoApi }) {
  const { borrador, setPie } = api;

  const textos: {
    campo: CampoTextoPie;
    id: string;
    label: string;
    max: number;
    placeholder: string;
    full?: boolean;
  }[] = [
    {
      campo: "marca",
      id: "de-pie-marca",
      label: "Nombre de la marca",
      max: 40,
      placeholder: "Ej. MAKCED",
    },
    {
      campo: "copyright",
      id: "de-pie-copyright",
      label: "Copyright",
      max: 80,
      placeholder: "© 2026 MAKCED. Todos los derechos reservados.",
    },
    {
      campo: "mensaje",
      id: "de-pie-mensaje",
      label: "Mensaje",
      max: 120,
      placeholder: "Ej. Envíos a todo el país en 48 horas",
      full: true,
    },
  ];

  return (
    <>
      {textos.map(({ campo, id, label, max, placeholder, full }) => (
        <div className={`db-field ${full ? "db-field-full" : ""}`} key={campo}>
          <label className="db-label" htmlFor={id}>
            {label}
          </label>
          <input
            id={id}
            name={`pie-${campo}`}
            className="db-input"
            required={campo === "marca"}
            maxLength={max}
            placeholder={placeholder}
            value={borrador.pie[campo]}
            onChange={(e) => setPie(campo, e.target.value)}
          />
          <Contador actual={borrador.pie[campo].length} max={max} />
        </div>
      ))}

      <CampoUrl
        id="de-pie-web"
        name="pie-web_url"
        label="Sitio web"
        placeholder="https://tutienda.com"
        value={borrador.pie.web_url}
        onChange={(valor) => setPie("web_url", valor)}
      />
      <CampoUrl
        id="de-pie-instagram"
        name="pie-instagram_url"
        label="Instagram"
        placeholder="https://instagram.com/tutienda"
        value={borrador.pie.instagram_url}
        onChange={(valor) => setPie("instagram_url", valor)}
      />
      <CampoUrl
        id="de-pie-whatsapp"
        name="pie-whatsapp_url"
        label="WhatsApp"
        placeholder="https://wa.me/573001234567"
        value={borrador.pie.whatsapp_url}
        onChange={(valor) => setPie("whatsapp_url", valor)}
      />

      <EditorEnlaces
        api={api}
        seccion="informacion"
        titulo="Enlaces de información"
        tituloCampo="titulo_informacion"
      />
      <EditorEnlaces
        api={api}
        seccion="ayuda"
        titulo="Enlaces de ayuda"
        tituloCampo="titulo_ayuda"
      />

      <p className="de-nota de-grid-full">
        Las categorías del pie se generan solas desde tu catálogo. Los iconos
        sociales solo aparecen cuando tienen una URL.
      </p>
    </>
  );
}
