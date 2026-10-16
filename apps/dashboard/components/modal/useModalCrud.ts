"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { subirImagenEnForm } from "@/lib/imagenes";
import type { GuardadoResultado, ImagenEstado } from "@/types/components";
import { esFallo, mensajeFallo } from "./modal-utils";

type Fase = "idle" | "subiendo" | "guardando" | "eliminando";

type CarpetaImagen = "productos" | "marcas" | "categorias" | "diseno";

interface UseModalCrudOptions<T> {
  entidad?: T;
  prefijo: string;
  carpeta: CarpetaImagen;
  mensajes: { crear: string; editar: string; eliminar: string };
  onSave?: (formData: FormData, entidad?: T) => void | Promise<void | GuardadoResultado>;
  onDelete?: (id: string) => Promise<GuardadoResultado>;
}

/**
 * Estado y handlers compartidos de los modales CRUD (marca/categoría/producto).
 * Vive el ciclo abrir→subir imagen→guardar/eliminar que era idéntico en los tres.
 */
export function useModalCrud<T>({
  entidad,
  prefijo,
  carpeta,
  mensajes,
  onSave,
  onDelete,
}: UseModalCrudOptions<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [fase, setFase] = useState<Fase>("idle");
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const imagenRef = useRef<ImagenEstado>({
    modo: "archivo",
    archivo: null,
    url: "",
    quitar: false,
  });
  const router = useRouter();

  const id = (entidad as { id?: string } | undefined)?.id;
  const nombre = (entidad as { nombre?: string } | undefined)?.nombre ?? "";
  const esCrear = !id;
  const ocupado = fase !== "idle";

  const abrir = () => {
    setFase("idle");
    setErrorGuardado(null);
    setIsOpen(true);
  };

  const cerrar = () => {
    setFase("idle");
    setErrorGuardado(null);
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onSave || ocupado) return;

    const formData = new FormData(e.currentTarget);
    const estado = imagenRef.current;

    setErrorGuardado(null);
    try {
      if (estado.modo === "archivo" && estado.archivo && !estado.quitar) {
        setFase("subiendo");
      }
      await subirImagenEnForm(formData, prefijo, estado, carpeta);

      setFase("guardando");
      const resultado = await onSave(formData, entidad);
      if (esFallo(resultado)) {
        setFase("idle");
        setErrorGuardado(resultado.error);
        return;
      }
      cerrar();
      router.refresh();
    } catch (err) {
      setFase("idle");
      setErrorGuardado(mensajeFallo(err, esCrear ? mensajes.crear : mensajes.editar));
    }
  };

  const handleEliminar = async () => {
    if (!id || !onDelete || ocupado) return;

    const confirmado = window.confirm(
      `¿Eliminar "${nombre}"?\nEsta acción no se puede deshacer.`,
    );
    if (!confirmado) return;

    setFase("eliminando");
    try {
      const resultado = await onDelete(id);
      if (esFallo(resultado)) {
        window.alert(resultado.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      window.alert(mensajeFallo(err, mensajes.eliminar));
    } finally {
      setFase("idle");
    }
  };

  return {
    isOpen,
    fase,
    errorGuardado,
    imagenRef,
    esCrear,
    ocupado,
    id,
    nombre,
    abrir,
    cerrar,
    handleSubmit,
    handleEliminar,
    setErrorGuardado,
  };
}
