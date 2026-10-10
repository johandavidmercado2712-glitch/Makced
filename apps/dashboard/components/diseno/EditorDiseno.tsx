"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { guardarDiseno, restaurarDiseno } from "@/actions/diseno";
import { subirImagenEnForm } from "@/lib/imagenes";
import { ImagenSelector } from "@/components/modal/ImagenSelector";
import { esFallo } from "@/components/modal/modal-utils";
import {
  COLOR_PRINCIPAL_DEFECTO,
  TIPOGRAFIAS,
  combinarDiseno,
  varsDesdeConfig,
  type ConfigDiseno,
  type SeccionDiseno,
  type Tipografia,
} from "@makced/db/diseno";
import type { ImagenEstado } from "@/types/components";
import "@/components/modal/modalProduct.css";

const URL_TIENDA = process.env.NEXT_PUBLIC_TIENDA_URL ?? "http://localhost:3000";
const HEX = /^#[0-9a-fA-F]{6}$/;

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

const PALETAS = [
  { nombre: "Turquesa", principal: "#4CE1AC", secundario: "#00E599" },
  { nombre: "Violeta", principal: "#7C53ED", secundario: "#A78BFA" },
  { nombre: "Naranja", principal: "#F97316", secundario: "#FDBA74" },
  { nombre: "Rosa", principal: "#EC4899", secundario: "#F9A8D4" },
  { nombre: "Azul", principal: "#3B82F6", secundario: "#93C5FD" },
  { nombre: "Rojo", principal: "#EF4444", secundario: "#FCA5A5" },
  { nombre: "Verde", principal: "#22C55E", secundario: "#86EFAC" },
  { nombre: "Grafito", principal: "#6B7280", secundario: "#CBD5E1" },
];

const PREFIJOS_POR_SECCION: Record<SeccionDiseno, string[]> = {
  estilo: [],
  logo: ["lg"],
  banner: ["bn0", "bn1", "bn2"],
  promo: ["pr", "nl"],
  titulos: [],
  pie: [],
};

function seccionDesde(config: ConfigDiseno, seccion: SeccionDiseno): Partial<ConfigDiseno> {
  switch (seccion) {
    case "estilo":
      return {
        color_secundario: config.color_secundario,
        radio: config.radio,
        tipografia: config.tipografia,
      };
    case "banner":
      return { banner: config.banner };
    case "promo":
      return { promo: config.promo, newsletter: config.newsletter };
    case "titulos":
      return { titulos: config.titulos };
    case "pie":
      return { pie: config.pie };
    case "logo":
      return {};
  }
}

function valorImagen(
  prefijo: string,
  imagenUrl: string | null,
  imagenKey: string | null,
  imagenes: Record<string, ImagenEstado>,
) {
  const estado = imagenes[prefijo];
  if (!estado) return [imagenUrl, imagenKey];
  if (estado.quitar) return [null, null];
  if (estado.archivo) {
    return [
      "archivo-pendiente",
      estado.archivo.name,
      estado.archivo.size,
      estado.archivo.lastModified,
      estado.archivo.type,
    ];
  }
  if (estado.modo === "archivo") return [imagenUrl, imagenKey];

  const url = estado.url.trim() || null;
  return [url, url === imagenUrl ? imagenKey : null];
}

function snapshotSeccion(
  seccion: SeccionDiseno,
  configGuardada: ConfigDiseno,
  borrador: ConfigDiseno,
  colorPrincipal: string,
  imagenes: Record<string, ImagenEstado>,
  logoUrl: string | null,
): string {
  let valores: unknown;
  switch (seccion) {
    case "estilo":
      valores = [
        colorPrincipal,
        borrador.color_secundario,
        borrador.radio,
        borrador.tipografia,
      ];
      break;
    case "logo":
      valores = valorImagen("lg", logoUrl, configGuardada.logo_key, imagenes);
      break;
    case "banner":
      valores = borrador.banner.slides.map((slide, indice) => [
        slide.palabra,
        slide.parrafo,
        ...valorImagen(
          `bn${indice}`,
          configGuardada.banner.slides[indice]?.imagen ?? null,
          configGuardada.banner.slides[indice]?.imagen_key ?? null,
          imagenes,
        ),
      ]);
      break;
    case "promo":
      valores = [borrador.promo, borrador.newsletter].map((banner, indice) => {
        const prefijo = indice === 0 ? "pr" : "nl";
        const guardado = indice === 0 ? configGuardada.promo : configGuardada.newsletter;
        return [
          banner.titulo,
          banner.descripcion,
          banner.boton,
          banner.link,
          ...valorImagen(prefijo, guardado.imagen, guardado.imagen_key, imagenes),
        ];
      });
      break;
    case "titulos":
      valores = borrador.titulos;
      break;
    case "pie":
      valores = borrador.pie;
      break;
  }

  return JSON.stringify(valores);
}

const urlImagen = (src: string) => (src.startsWith("/") ? `${URL_TIENDA}${src}` : src);

function Contador({ actual, max }: { actual: number; max: number }) {
  return (
    <span
      className={actual >= max ? "de-contador de-contador-full" : "de-contador"}
      aria-hidden="true"
    >
      {actual}/{max}
    </span>
  );
}

interface EditorDisenoProps {
  config: ConfigDiseno;
  colorPrincipal: string;
  logoUrl: string | null;
}

export default function EditorDiseno({ config, colorPrincipal, logoUrl }: EditorDisenoProps) {
  const router = useRouter();
  const [tab, setTab] = useState<SeccionDiseno>("estilo");
  const [borrador, setBorrador] = useState<ConfigDiseno>(config);
  const [colorP, setColorP] = useState(colorPrincipal);
  const [exito, setExito] = useState(false);
  const [fase, setFase] = useState<"idle" | "subiendo" | "guardando" | "restaurando">("idle");
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [imagenes, setImagenes] = useState<Record<string, ImagenEstado>>({});
  const [baseline, setBaseline] = useState(() =>
    snapshotSeccion("estilo", config, config, colorPrincipal, {}, logoUrl),
  );
  const ocupado = fase !== "idle";
  const sucio =
    baseline !==
    snapshotSeccion(tab, config, borrador, colorP, imagenes, logoUrl);

  // adopta el estado del servidor cuando vuelve tras guardar o restaurar
  // (patrón "ajustar estado durante el render" de React)
  const [servidor, setServidor] = useState({ config, colorPrincipal, logoUrl });
  if (
    servidor.config !== config ||
    servidor.colorPrincipal !== colorPrincipal ||
    servidor.logoUrl !== logoUrl
  ) {
    setServidor({ config, colorPrincipal, logoUrl });
    if (!sucio) {
      setBorrador(config);
      setColorP(colorPrincipal);
      setImagenes({});
      setBaseline(
        snapshotSeccion(tab, config, config, colorPrincipal, {}, logoUrl),
      );
      setVersion((v) => v + 1);
    }
  }

  // la tipografía nueva necesita su ficha de Google Fonts en la vista previa
  useEffect(() => {
    const familia = borrador.tipografia;
    if (familia === "Figtree") return;
    const id = `de-font-${familia}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      familia,
    )}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }, [borrador.tipografia]);

  const marcarCambio = () => {
    setExito(false);
  };

  const notificarImagen = (prefijo: string, estado: ImagenEstado) => {
    setImagenes((prev) => ({ ...prev, [prefijo]: estado }));
    marcarCambio();
  };

  const setCampo = <K extends keyof ConfigDiseno>(clave: K, valor: ConfigDiseno[K]) => {
    setBorrador((prev) => ({ ...prev, [clave]: valor }));
    marcarCambio();
  };

  const setTitulos = (campo: "categorias" | "productos", valor: string) => {
    setBorrador((prev) => ({ ...prev, titulos: { ...prev.titulos, [campo]: valor } }));
    marcarCambio();
  };

  const setPie = (campo: "marca" | "copyright" | "mensaje", valor: string) => {
    setBorrador((prev) => ({ ...prev, pie: { ...prev.pie, [campo]: valor } }));
    marcarCambio();
  };

  const setSlide = (indice: number, campo: "palabra" | "parrafo", valor: string) => {
    setBorrador((prev) => ({
      ...prev,
      banner: {
        ...prev.banner,
        slides: prev.banner.slides.map((slide, i) =>
          i === indice ? { ...slide, [campo]: valor } : slide,
        ),
      },
    }));
    marcarCambio();
  };

  const setBanner = (
    seccion: "promo" | "newsletter",
    campo: "titulo" | "descripcion" | "boton" | "link",
    valor: string,
  ) => {
    setBorrador((prev) => {
      if (seccion === "promo") {
        return { ...prev, promo: { ...prev.promo, [campo]: valor } };
      }
      return { ...prev, newsletter: { ...prev.newsletter, [campo]: valor } };
    });
    marcarCambio();
  };

  const limpiarPrefijos = (seccion: SeccionDiseno) => {
    const prefijos = PREFIJOS_POR_SECCION[seccion];
    setImagenes((prev) => {
      if (!prefijos.some((p) => p in prev)) return prev;
      const copia = { ...prev };
      prefijos.forEach((p) => delete copia[p]);
      return copia;
    });
  };

  const descartarSeccion = () => {
    setBorrador((prev) => ({ ...prev, ...seccionDesde(config, tab) }));
    if (tab === "estilo") setColorP(colorPrincipal);
    limpiarPrefijos(tab);
    setBaseline(snapshotSeccion(tab, config, config, colorPrincipal, {}, logoUrl));
    setVersion((v) => v + 1);
    setExito(false);
    setError(null);
  };

  const cambiarTab = (siguiente: SeccionDiseno) => {
    if (siguiente === tab || ocupado) return;
    if (sucio) {
      const salir = window.confirm(
        "Tienes cambios sin guardar en esta sección. ¿Salir y descartarlos?",
      );
      if (!salir) return;
      setBorrador((prev) => ({ ...prev, ...seccionDesde(config, tab) }));
      if (tab === "estilo") setColorP(colorPrincipal);
    }
    limpiarPrefijos(tab);
    setBaseline(
      snapshotSeccion(siguiente, config, config, colorPrincipal, {}, logoUrl),
    );
    setVersion((v) => v + 1);
    setExito(false);
    setError(null);
    setTab(siguiente);
  };

  const descartar = () => {
    if (!sucio || ocupado) return;
    if (!window.confirm("¿Descartar los cambios sin guardar de esta sección?")) return;
    descartarSeccion();
  };

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ocupado || !sucio) return;
    const formData = new FormData(e.currentTarget);
    const prefijos = PREFIJOS_POR_SECCION[tab];
    const snapshotGuardado = snapshotSeccion(
      tab,
      config,
      borrador,
      colorP,
      imagenes,
      logoUrl,
    );
    setError(null);
    try {
      const haySubida = prefijos.some((p) => {
        const est = imagenes[p];
        return est && !est.quitar && est.modo === "archivo" && est.archivo;
      });
      setFase(haySubida ? "subiendo" : "guardando");
      for (const prefijo of prefijos) {
        const est = imagenes[prefijo];
        if (est) await subirImagenEnForm(formData, prefijo, est, "diseno");
      }
      setFase("guardando");
      const resultado = await guardarDiseno(tab, formData);
      if (esFallo(resultado)) {
        setFase("idle");
        setError(resultado.error);
        return;
      }
      setFase("idle");
      setBaseline(snapshotGuardado);
      setExito(true);
      router.refresh();
    } catch (err) {
      setFase("idle");
      setError(err instanceof Error ? err.message : "No se pudieron guardar los cambios");
    }
  };

  const restaurar = async () => {
    if (ocupado) return;
    const confirmado = window.confirm(
      "¿Restaurar el diseño original?\nSe reemplazan todos los cambios guardados (colores, textos, logo e imágenes) por los valores de fábrica.",
    );
    if (!confirmado) return;
    setFase("restaurando");
    setError(null);
    setExito(false);
    try {
      const resultado = await restaurarDiseno();
      if (esFallo(resultado)) {
        setFase("idle");
        window.alert(resultado.error);
        return;
      }
      setBorrador(combinarDiseno({}));
      setColorP(COLOR_PRINCIPAL_DEFECTO);
      setImagenes({});
      setBaseline(
        snapshotSeccion(
          tab,
          combinarDiseno({}),
          combinarDiseno({}),
          COLOR_PRINCIPAL_DEFECTO,
          {},
          null,
        ),
      );
      setVersion((v) => v + 1);
      setExito(true);
      setFase("idle");
      router.refresh();
    } catch (err) {
      setFase("idle");
      window.alert(
        err instanceof Error ? err.message : "No se pudo restaurar el diseño",
      );
    }
  };

  const imagenVista = (prefijo: string, guardada: string | null): string | null => {
    const est = imagenes[prefijo];
    if (!est) return guardada;
    if (est.quitar) return null;
    if (est.modo === "url") return est.url.trim() || guardada;
    return guardada;
  };

  const renderImagen = (src: string | null, alt: string) =>
    src ? (
      <img src={urlImagen(src)} alt={alt} />
    ) : (
      <span className="de-prev-fallback">
        <ImageIcon size={16} />
      </span>
    );

  const activa = TABS.find((t) => t.id === tab) ?? TABS[0];
  const logoVista = imagenVista("lg", logoUrl);
  const estiloVars = varsDesdeConfig(colorP, borrador) as unknown as React.CSSProperties;

  const pila = ocupado
    ? {
        clase: "de-pila de-pila-busy",
        texto:
          fase === "restaurando"
            ? "Restaurando…"
            : fase === "subiendo"
              ? "Subiendo imagen…"
              : "Guardando…",
      }
    : exito
      ? { clase: "de-pila de-pila-ok", texto: "Guardado ✓" }
      : sucio
        ? { clase: "de-pila de-pila-warn", texto: "Cambios sin guardar" }
        : { clase: "de-pila", texto: "Todo guardado" };

  const estadoBarra = error ? (
    <p className="db-modal-error" role="alert">
      {error}
    </p>
  ) : exito ? (
    <p className="de-barra-ok" role="status">
      <CheckCircle2 size={14} /> Guardado ✓ — la tienda se actualiza en ~1 min
    </p>
  ) : sucio ? (
    <p className="de-barra-pendiente">Cambios sin guardar en esta sección</p>
  ) : (
    <p className="de-barra-muted">Todo guardado</p>
  );

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
            onClick={() => cambiarTab(t.id)}
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
                {tab === "estilo" && (
                  <>
                    <div className="de-subsection de-grid-full">
                      <h3 className="de-subsection-title">PALETAS RÁPIDAS</h3>
                      <div className="de-palettes">
                        {PALETAS.map((p) => (
                          <button
                            key={p.nombre}
                            type="button"
                            className={
                              colorP === p.principal &&
                              borrador.color_secundario === p.secundario
                                ? "de-palette de-palette-active"
                                : "de-palette"
                            }
                            onClick={() => {
                              setColorP(p.principal);
                              setCampo("color_secundario", p.secundario);
                            }}
                          >
                            <span
                              className="de-palette-color"
                              style={{ background: p.principal }}
                            />
                            <span className="de-palette-name">{p.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="de-colors de-grid-full">
                      <div className="db-field">
                        <label className="db-label" htmlFor="de-color-principal">
                          Color principal
                        </label>
                        <div className="de-color-input">
                          <label
                            className="de-color-swatch"
                            style={{ background: HEX.test(colorP) ? colorP : "#94A3B8" }}
                          >
                            <input
                              type="color"
                              value={HEX.test(colorP) ? colorP : "#000000"}
                              onChange={(e) => {
                                setColorP(e.target.value);
                                marcarCambio();
                              }}
                              aria-label="Elegir color principal"
                            />
                          </label>
                          <input
                            id="de-color-principal"
                            name="color_principal"
                            className="db-input de-color-hex"
                            value={colorP}
                            onChange={(e) => {
                              setColorP(e.target.value);
                              marcarCambio();
                            }}
                            pattern="#[0-9a-fA-F]{6}"
                            title="Usa el formato #AABBCC"
                            spellCheck={false}
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      <div className="db-field">
                        <label className="db-label" htmlFor="de-color-secundario">
                          Color secundario
                        </label>
                        <div className="de-color-input">
                          <label
                            className="de-color-swatch"
                            style={{
                              background: HEX.test(borrador.color_secundario)
                                ? borrador.color_secundario
                                : "#94A3B8",
                            }}
                          >
                            <input
                              type="color"
                              value={
                                HEX.test(borrador.color_secundario)
                                  ? borrador.color_secundario
                                  : "#000000"
                              }
                              onChange={(e) =>
                                setCampo("color_secundario", e.target.value)
                              }
                              aria-label="Elegir color secundario"
                            />
                          </label>
                          <input
                            id="de-color-secundario"
                            name="color_secundario"
                            className="db-input de-color-hex"
                            value={borrador.color_secundario}
                            onChange={(e) => setCampo("color_secundario", e.target.value)}
                            pattern="#[0-9a-fA-F]{6}"
                            title="Usa el formato #AABBCC"
                            spellCheck={false}
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="db-field">
                      <label className="db-label" htmlFor="de-tipografia">
                        Tipografía
                      </label>
                      <select
                        id="de-tipografia"
                        name="tipografia"
                        className="db-select"
                        value={borrador.tipografia}
                        onChange={(e) => setCampo("tipografia", e.target.value as Tipografia)}
                      >
                        {TIPOGRAFIAS.map((familia) => (
                          <option key={familia} value={familia}>
                            {familia}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="db-field">
                      <label className="db-label" htmlFor="de-radio">
                        Redondeo de esquinas
                      </label>
                      <div className="de-slider">
                        <input
                          id="de-radio"
                          name="radio"
                          type="range"
                          min={0}
                          max={24}
                          step={1}
                          className="de-range"
                          value={borrador.radio}
                          onChange={(e) => setCampo("radio", Number(e.target.value))}
                        />
                        <span className="de-slider-value">{borrador.radio} px</span>
                      </div>
                      <p className="de-slider-hint">De cuadrado (0 px) a muy redondeado (24 px)</p>
                    </div>
                  </>
                )}

                {tab === "logo" && (
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
                )}

                {tab === "banner" &&
                  borrador.banner.slides.map((slide, i) => (
                    <div className="de-tarjeta de-grid-full" key={i}>
                      <div className="de-tarjeta-head">
                        <strong>Slide {i + 1}</strong>
                        <span>se rota en el hero de tu página de inicio</span>
                      </div>
                      <div className="de-tarjeta-campos">
                        <div className="db-field db-field-full">
                          <label className="db-label" htmlFor={`bn${i}-palabra`}>
                            Palabra
                          </label>
                          <input
                            id={`bn${i}-palabra`}
                            name={`bn${i}-palabra`}
                            className="db-input"
                            required
                            maxLength={40}
                            placeholder="Ej. NUEVA COLECCIÓN"
                            value={slide.palabra}
                            onChange={(e) => setSlide(i, "palabra", e.target.value)}
                          />
                          <Contador actual={slide.palabra.length} max={40} />
                        </div>
                        <div className="db-field db-field-full">
                          <label className="db-label" htmlFor={`bn${i}-parrafo`}>
                            Párrafo
                          </label>
                          <textarea
                            id={`bn${i}-parrafo`}
                            name={`bn${i}-parrafo`}
                            className="db-textarea"
                            maxLength={220}
                            placeholder="Texto corto que acompaña al título (opcional)…"
                            value={slide.parrafo}
                            onChange={(e) => setSlide(i, "parrafo", e.target.value)}
                          />
                          <Contador actual={slide.parrafo.length} max={220} />
                        </div>
                        <ImagenSelector
                          key={`bn${i}-${version}`}
                          prefijo={`bn${i}`}
                          etiqueta={`Imagen del slide ${i + 1}`}
                          urlActual={config.banner.slides[i].imagen || null}
                          keyActual={config.banner.slides[i].imagen_key}
                          textoQuitada={`del slide ${i + 1}`}
                          onCambio={(estado) => notificarImagen(`bn${i}`, estado)}
                          onError={setError}
                        />
                      </div>
                    </div>
                  ))}

                {tab === "promo" && (
                  <>
                    {(["promo", "newsletter"] as const).map((seccion) => (
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
                )}

                {tab === "titulos" && (
                  <>
                    <div className="db-field">
                      <label className="db-label" htmlFor="de-titulo-categorias">
                        Título de CATEGORIAS
                      </label>
                      <input
                        id="de-titulo-categorias"
                        name="titulo-categorias"
                        className="db-input"
                        required
                        maxLength={40}
                        placeholder="Ej. CATEGORÍAS"
                        value={borrador.titulos.categorias}
                        onChange={(e) => setTitulos("categorias", e.target.value)}
                      />
                      <Contador actual={borrador.titulos.categorias.length} max={40} />
                    </div>
                    <div className="db-field">
                      <label className="db-label" htmlFor="de-titulo-productos">
                        Título de PRODUCTOS
                      </label>
                      <input
                        id="de-titulo-productos"
                        name="titulo-productos"
                        className="db-input"
                        required
                        maxLength={40}
                        placeholder="Ej. PRODUCTOS DESTACADOS"
                        value={borrador.titulos.productos}
                        onChange={(e) => setTitulos("productos", e.target.value)}
                      />
                      <Contador actual={borrador.titulos.productos.length} max={40} />
                    </div>
                    <p className="de-nota de-grid-full">
                      Se muestran en mayúsculas en la home, tal como los escribas.
                    </p>
                  </>
                )}

                {tab === "pie" && (
                  <>
                    <div className="db-field">
                      <label className="db-label" htmlFor="de-pie-marca">
                        Nombre de la marca
                      </label>
                      <input
                        id="de-pie-marca"
                        name="pie-marca"
                        className="db-input"
                        required
                        maxLength={40}
                        placeholder="Ej. MAKCED"
                        value={borrador.pie.marca}
                        onChange={(e) => setPie("marca", e.target.value)}
                      />
                      <Contador actual={borrador.pie.marca.length} max={40} />
                    </div>
                    <div className="db-field">
                      <label className="db-label" htmlFor="de-pie-copyright">
                        Copyright
                      </label>
                      <input
                        id="de-pie-copyright"
                        name="pie-copyright"
                        className="db-input"
                        maxLength={80}
                        placeholder="© 2026 MAKCED. Todos los derechos reservados."
                        value={borrador.pie.copyright}
                        onChange={(e) => setPie("copyright", e.target.value)}
                      />
                      <Contador actual={borrador.pie.copyright.length} max={80} />
                    </div>
                    <div className="db-field db-field-full">
                      <label className="db-label" htmlFor="de-pie-mensaje">
                        Mensaje
                      </label>
                      <input
                        id="de-pie-mensaje"
                        name="pie-mensaje"
                        className="db-input"
                        maxLength={120}
                        placeholder="Ej. Envíos a todo el país en 48 horas"
                        value={borrador.pie.mensaje}
                        onChange={(e) => setPie("mensaje", e.target.value)}
                      />
                      <Contador actual={borrador.pie.mensaje.length} max={120} />
                    </div>
                    <p className="de-nota de-grid-full">
                      Las categorías del pie se generan solas desde tu catálogo.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="db-modal-footer de-barra">
              {estadoBarra}
              <button
                type="button"
                className="db-modal-btn db-modal-btn-secondary"
                onClick={descartar}
                disabled={ocupado || !sucio}
              >
                Descartar
              </button>
              <button
                type="submit"
                className="db-modal-btn db-modal-btn-primary"
                disabled={ocupado || !sucio}
              >
                {fase === "subiendo"
                  ? "Subiendo imagen…"
                  : fase === "guardando"
                    ? "Guardando…"
                    : "Guardar cambios"}
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
              {tab === "estilo" && (
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
              )}

              {tab === "logo" && (
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
              )}

              {tab === "banner" && (
                <div className="de-prev-banner">
                  {borrador.banner.slides.map((slide, i) => (
                    <div className="de-prev-slide" key={i}>
                      <span className="de-prev-slide-img">
                        {renderImagen(
                          imagenVista(`bn${i}`, config.banner.slides[i].imagen || null),
                          slide.palabra || `Slide ${i + 1}`,
                        )}
                      </span>
                      <div className="de-prev-slide-txt">
                        <strong>{slide.palabra || `Slide ${i + 1}`}</strong>
                        <p>{slide.parrafo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "promo" && (
                <div className="de-prev-doble">
                  {(["promo", "newsletter"] as const).map((seccion) => (
                    <div className="de-prev-mini" key={seccion}>
                      <span className="de-prev-mini-img">
                        {renderImagen(
                          imagenVista(
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
              )}

              {tab === "titulos" && (
                <div className="de-prev-titulos">
                  <h1 className="de-prev-h1">{borrador.titulos.categorias}</h1>
                  <span className="de-prev-linea" />
                  <h1 className="de-prev-h1">{borrador.titulos.productos}</h1>
                </div>
              )}

              {tab === "pie" && (
                <div className="de-prev-pie">
                  <strong>{borrador.pie.marca}</strong>
                  <span>
                    © {new Date().getFullYear()} {borrador.pie.marca}. {borrador.pie.copyright}
                  </span>
                  <span className="de-prev-pie-mensaje">{borrador.pie.mensaje}</span>
                </div>
              )}
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
