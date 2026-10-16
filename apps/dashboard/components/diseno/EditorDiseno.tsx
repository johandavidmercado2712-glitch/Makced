"use client";

import type { FC } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  Megaphone,
  PanelTop,
  Paintbrush,
  RotateCcw,
  Type,
} from "lucide-react";
import {
  varsDesdeConfig,
  type ConfigDiseno,
  type SeccionDiseno,
} from "@makced/db/diseno";
import { useEditorEstado, useEditorGuardar, useEditorSeccion } from "./useEditorDiseno";
import { URL_TIENDA, type EditorDisenoApi } from "./paneles/comunes";
import { PanelEstilo } from "./paneles/PanelEstilo";
import { PanelLogo } from "./paneles/PanelLogo";
import { PanelBanner } from "./paneles/PanelBanner";
import { PanelPromo } from "./paneles/PanelPromo";
import { PanelTitulos } from "./paneles/PanelTitulos";
import { PanelPie } from "./paneles/PanelPie";
import {
  PrevEstilo,
  PrevLogo,
  PrevBanner,
  PrevPromo,
  PrevTitulos,
  PrevPie,
} from "./paneles/Previews";
import "@/components/modal/modalProduct.css";

interface TabMeta {
  id: SeccionDiseno;
  label: string;
  icon: typeof Paintbrush;
  donde: string;
}

const TABS: TabMeta[] = [
  {
    id: "estilo",
    label: "Estilo global",
    icon: Paintbrush,
    donde:
      "Colores, esquinas y tipografía de TODA la tienda: botones, enlaces, precios y tarjetas.",
  },
  {
    id: "logo",
    label: "Logo",
    icon: ImageIcon,
    donde: "Se muestra en la barra superior y en el pie de tu tienda.",
  },
  {
    id: "banner",
    label: "Banner principal",
    icon: PanelTop,
    donde:
      "La zona superior de tu inicio: 3 slides con imagen, palabra y párrafo que se rotan solos.",
  },
  {
    id: "promo",
    label: "Banners de la home",
    icon: Megaphone,
    donde:
      "Los dos banners con imagen de la home: colección (debajo de CATEGORIAS) y newsletter (al final del inicio).",
  },
  {
    id: "titulos",
    label: "H₁ Títulos de secciones",
    icon: Type,
    donde: "Los títulos grandes CATEGORIAS y PRODUCTOS de la página de inicio.",
  },
  {
    id: "pie",
    label: "Pie de página",
    icon: FileText,
    donde:
      "El bloque final con tu marca, copyright y mensaje. Las categorías del pie se generan solas.",
  },
];

const PANELES: Record<SeccionDiseno, FC<{ api: EditorDisenoApi }>> = {
  estilo: PanelEstilo,
  logo: PanelLogo,
  banner: PanelBanner,
  promo: PanelPromo,
  titulos: PanelTitulos,
  pie: PanelPie,
};

const PREVIEWS: Record<SeccionDiseno, FC<{ api: EditorDisenoApi }>> = {
  estilo: PrevEstilo,
  logo: PrevLogo,
  banner: PrevBanner,
  promo: PrevPromo,
  titulos: PrevTitulos,
  pie: PrevPie,
};

const estadoPila = (
  ocupado: boolean,
  fase: "idle" | "subiendo" | "guardando" | "restaurando",
  exito: boolean,
  sucio: boolean,
) => {
  if (ocupado) {
    return {
      clase: "de-pila de-pila-busy",
      texto:
        fase === "restaurando"
          ? "Restaurando…"
          : fase === "subiendo"
            ? "Subiendo imagen…"
            : "Guardando…",
    };
  }
  if (exito) return { clase: "de-pila de-pila-ok", texto: "Guardado ✓" };
  if (sucio) return { clase: "de-pila de-pila-warn", texto: "Cambios sin guardar" };
  return { clase: "de-pila", texto: "Todo guardado" };
};

const etiquetaGuardar = (
  fase: "idle" | "subiendo" | "guardando" | "restaurando",
): string => {
  if (fase === "subiendo") return "Subiendo imagen…";
  if (fase === "guardando") return "Guardando…";
  return "Guardar cambios";
};

function BarraEstado({
  error,
  exito,
  sucio,
}: {
  error: string | null;
  exito: boolean;
  sucio: boolean;
}) {
  if (error) {
    return (
      <p className="db-modal-error" role="alert">
        {error}
      </p>
    );
  }
  if (exito) {
    return (
      <p className="de-barra-ok" role="status">
        <CheckCircle2 size={14} /> Guardado ✓ — la tienda se actualiza en ~1 min
      </p>
    );
  }
  if (sucio) {
    return <p className="de-barra-pendiente">Cambios sin guardar en esta sección</p>;
  }
  return <p className="de-barra-muted">Todo guardado</p>;
}

interface EditorDisenoProps {
  config: ConfigDiseno;
  colorPrincipal: string;
  logoUrl: string | null;
}

export default function EditorDiseno({ config, colorPrincipal, logoUrl }: EditorDisenoProps) {
  const estado = useEditorEstado(config, colorPrincipal, logoUrl);
  const seccion = useEditorSeccion(estado, config, colorPrincipal, logoUrl);
  const { guardar, restaurar } = useEditorGuardar(estado, estado.tab, estado.sucio);

  const {
    tab,
    borrador,
    colorP,
    fase,
    error,
    exito,
    ocupado,
    sucio,
    imagenes,
    version,
    setColorP,
    marcarCambio,
    setCampo,
    setTitulos,
    setPie,
    setSlide,
    setBanner,
    notificarImagen,
    setError,
  } = estado;

  const api: EditorDisenoApi = {
    config,
    borrador,
    colorP,
    imagenes,
    logoUrl,
    version,
    setColorP,
    marcarCambio,
    setCampo,
    setTitulos,
    setPie,
    setSlide,
    setBanner,
    notificarImagen,
    setError,
  };

  const activa = TABS.find((t) => t.id === tab) ?? TABS[0];
  const estiloVars = varsDesdeConfig(colorP, borrador) as unknown as React.CSSProperties;
  const pila = estadoPila(ocupado, fase, exito, sucio);
  const PanelActivo = PANELES[tab];
  const PrevActiva = PREVIEWS[tab];

  return (
    <>
      <div className="db-panel db-header">
        <div>
          <h1 className="db-title">Diseño de la tienda</h1>
          <p className="db-subtitle">
            Personaliza colores, textos, logo e imágenes de tu tienda pública. Guarda cada
            sección cuando termines.
          </p>
        </div>
        <div className="db-header-actions">
          <span className={pila.clase} role="status">
            {pila.texto}
          </span>
          <button
            type="button"
            className="db-btn-secondary"
            onClick={restaurar}
            disabled={ocupado}
          >
            <RotateCcw size={15} />
            {fase === "restaurando" ? "Restaurando…" : "Restaurar todo"}
          </button>
          <a
            className="db-btn-primary"
            href={URL_TIENDA}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={15} /> Ver tienda
          </a>
        </div>
      </div>

      <div className="de-tabs" role="tablist" aria-label="Secciones del diseño">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "de-tab de-tab-active" : "de-tab"}
            onClick={() => seccion.cambiarTab(t.id)}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="de-content">
        <form className="de-left" onSubmit={guardar}>
          <div className="db-panel de-form-panel">
            <div className="de-form-body">
              <div className="de-section-header">
                <activa.icon size={20} />
                <div>
                  <h2 className="de-section-title">{activa.label}</h2>
                  <p className="de-section-desc">{activa.donde}</p>
                </div>
              </div>

              <div className="de-campos">
                <PanelActivo api={api} />
              </div>
            </div>

            <div className="db-modal-footer de-barra">
              <BarraEstado error={error} exito={exito} sucio={sucio} />
              <button
                type="button"
                className="db-modal-btn db-modal-btn-secondary"
                onClick={seccion.descartar}
                disabled={ocupado || !sucio}
              >
                Descartar
              </button>
              <button
                type="submit"
                className="db-modal-btn db-modal-btn-primary"
                disabled={ocupado || !sucio}
              >
                {etiquetaGuardar(fase)}
              </button>
            </div>
          </div>
        </form>

        <aside className="de-right">
          <div className="db-panel de-preview-card">
            <div className="de-live-header">
              <span className="de-live-badge">VISTA PREVIA EN VIVO</span>
              <a
                className="de-live-link"
                href={URL_TIENDA}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir ↗
              </a>
            </div>

            <div className="de-muestra" style={estiloVars}>
              <PrevActiva api={api} />
            </div>

            <p className="de-preview-pie">
              Así se verá en tu tienda con los cambios actuales.
              {sucio ? " Guarda para aplicarlos." : ""}
            </p>
          </div>

          <div className="db-panel de-help-card">
            <div className="de-help-row">
              <span className="de-help-icon">
                <Lightbulb size={18} />
              </span>
              <div>
                <h3 className="de-help-title">¿Cómo funciona?</h3>
                <p className="de-help-text">
                  Edita los campos y pulsa <strong>Guardar cambios</strong> de cada sección. Los
                  cambios se aplican a tu tienda pública en menos de un minuto.{" "}
                  <strong>Restaurar todo</strong> vuelve al diseño original.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
