"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { updateTiendaWhatsapp } from "@/actions/tienda";

interface PanelWhatsappProps {
  numero: string | null;
}

export default function PanelWhatsapp({ numero }: PanelWhatsappProps) {
  const [valor, setValor] = useState(numero ?? "");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limpio = e.target.value.replace(/\D/g, "");
    setValor(limpio);
    setAviso(null);
  };

  const validar = (v: string) => /^\d{8,15}$/.test(v.trim());

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar(valor)) {
      setAviso({
        tipo: "error",
        texto: "El número debe contener solo dígitos (8–15 caracteres), sin espacios ni símbolos.",
      });
      return;
    }
    setGuardando(true);
    setAviso(null);
    try {
      const res = await updateTiendaWhatsapp(valor);
      if (res.ok) {
        setAviso({ tipo: "ok", texto: "Número guardado correctamente." });
      } else {
        setAviso({ tipo: "error", texto: res.error ?? "No se pudo guardar el número." });
      }
    } catch {
      setAviso({ tipo: "error", texto: "Error inesperado al guardar." });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="mt-wsp" onSubmit={guardar}>
      <div className="db-field">
        <label className="db-label" htmlFor="mt-wsp-numero">
          Número de WhatsApp
        </label>
        <input
          id="mt-wsp-numero"
          type="text"
          inputMode="numeric"
          className="db-input"
          value={valor}
          onChange={handleChange}
          placeholder="Ej. 573001234567"
          autoComplete="off"
        />
      </div>
      <p className="mt-wsp-ayuda">
        Los pedidos por WhatsApp del carrito llegarán a este número. Usa el formato internacional sin «+» ni espacios (ej. 573001234567).
      </p>
      <button type="submit" className="db-btn-primary mt-wsp-btn" disabled={guardando}>
        <MessageCircle size={15} /> {guardando ? "Guardando..." : "Guardar"}
      </button>
      {aviso && (
        <p
          className={aviso.tipo === "error" ? "mt-wsp-aviso mt-wsp-aviso-error" : "mt-wsp-aviso"}
          role="status"
        >
          {aviso.texto}
        </p>
      )}
    </form>
  );
}
