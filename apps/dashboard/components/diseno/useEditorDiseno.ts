"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { guardarDiseno, restaurarDiseno } from "@/actions/diseno";
import { subirImagenEnForm } from "@/lib/imagenes";
import { esFallo } from "@/components/modal/modal-utils";
import {
  COLOR_PRINCIPAL_DEFECTO,
  combinarDiseno,
  type ConfigDiseno,
  type SeccionDiseno,
} from "@makced/db/diseno";
import type { ImagenEstado } from "@/types/components";
import { PREFIJOS_POR_SECCION, seccionDesde, snapshotSeccion } from "./editor-interno";

/**
 * Estado base del editor: borrador, colores, imágenes, baseline y fase.
 * Centraliza el render-time "ajustar estado del servidor" y la carga de la
 * fuente de Google Fonts para la vista previa.
 */
export function useEditorEstado(config: ConfigDiseno, colorPrincipal: string, logoUrl: string | null) {
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

  return {
    config,
    logoUrl,
    tab,
    setTab,
    borrador,
    setBorrador,
    colorP,
    setColorP,
    exito,
    setExito,
    fase,
    setFase,
    error,
    setError,
    version,
    setVersion,
    imagenes,
    setImagenes,
    baseline,
    setBaseline,
    ocupado,
    sucio,
    marcarCambio,
    notificarImagen,
    setCampo,
    setTitulos,
    setPie,
    setSlide,
    setBanner,
    limpiarPrefijos,
  };
}

export type EstadoEditor = ReturnType<typeof useEditorEstado>;

/**
 * Navegación entre secciones: cambiar de tab con confirmación de descarte,
 * descartar la sección activa o todo el flujo de salida con cambios sucios.
 */
export function useEditorSeccion(
  estado: EstadoEditor,
  config: ConfigDiseno,
  colorPrincipal: string,
  logoUrl: string | null,
) {
  const {
    tab,
    setTab,
    setBorrador,
    setColorP,
    setBaseline,
    setVersion,
    setExito,
    setError,
    limpiarPrefijos,
    ocupado,
    sucio,
  } = estado;

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

  return { cambiarTab, descartar, descartarSeccion };
}

/**
 * Persistencia: guardar la sección activa (con subida de imágenes en paralelo)
 * o restaurar el diseño de fábrica completo.
 */
export function useEditorGuardar(
  estado: EstadoEditor,
  tab: SeccionDiseno,
  sucio: boolean,
) {
  const {
    ocupado,
    borrador,
    colorP,
    imagenes,
    baseline,
    setFase,
    setError,
    setExito,
    setBorrador,
    setColorP,
    setImagenes,
    setBaseline,
    setVersion,
  } = estado;
  const router = useRouter();

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ocupado || !sucio) return;
    const formData = new FormData(e.currentTarget);
    const prefijos = PREFIJOS_POR_SECCION[tab];
    const snapshotGuardado = snapshotSeccion(
      tab,
      estado.config,
      borrador,
      colorP,
      imagenes,
      estado.logoUrl,
    );
    setError(null);
    try {
      const haySubida = prefijos.some((p) => {
        const est = imagenes[p];
        return est && !est.quitar && est.modo === "archivo" && est.archivo;
      });
      setFase(haySubida ? "subiendo" : "guardando");
      await Promise.all(
        prefijos.map(async (prefijo) => {
          const est = imagenes[prefijo];
          if (est) await subirImagenEnForm(formData, prefijo, est, "diseno");
        }),
      );
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

  return { guardar, restaurar };
}
