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

  const rawId = (entidad as { id?: string } | undefined)?.id;
  const nombre = (entidad as { nombre?: string } | undefined)?.nombre ?? "";
  const esCrear = !rawId;
  const ocupado = fase !== "idle";

  const onDeleteFn = onDelete ?? (async () => ({ ok: true } as const));

  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);

  const abrir = () => {
    setFase("idle");
    setErrorGuardado(null);
    setIsOpen(true);
  };

  const cerrar = () => {
    setFase("idle");
    setErrorGuardado(null);
    setIsOpen(false);
    setMostrarConfirmEliminar(false);
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

  const handleEliminar = () => {
    if (!rawId || !onDelete || ocupado) return;
    setMostrarConfirmEliminar(true);
  };

  const handleConfirmEliminar = async () => {
    setMostrarConfirmEliminar(false);
    setFase("eliminando");
    try {
      const resultado = await onDeleteFn!(rawId!);
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

  const handleCancelEliminar = () => {
    setMostrarConfirmEliminar(false);
  };

  return {
    isOpen,
    fase,
    errorGuardado,
    imagenRef,
    esCrear,
    ocupado,
    id: rawId,
    nombre,
    abrir,
    cerrar,
    handleSubmit,
    handleEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    mostrarConfirmEliminar,
    setErrorGuardado,
  };
}
