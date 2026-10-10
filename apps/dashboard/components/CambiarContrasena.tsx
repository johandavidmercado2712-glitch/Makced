"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "@/components/modal/modalProduct.css";

export default function CambiarContrasena({ email }: { email: string | null }) {
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [ver, setVer] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "error" | "info"; texto: string } | null>(null);

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nueva !== confirmar) {
      setAviso({ tipo: "error", texto: "Las contraseñas no coinciden." });
      return;
    }
    setAviso({
      tipo: "info",
      texto: "La edición de contraseña estará disponible próximamente.",
    });
  };

  const tipoInput = ver ? "text" : "password";

  return (
    <form className="mt-pass" onSubmit={enviar}>
      {email && <p className="mt-pass-email">Se enviará la confirmación a <strong>{email}</strong>.</p>}

      <div className="db-field">
        <label className="db-label" htmlFor="mt-nueva">
          Nueva contraseña
        </label>
        <div className="mt-pass-input">
          <input
            id="mt-nueva"
            type={tipoInput}
            className="db-input"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
          />
          <button
            type="button"
            className="mt-pass-ojo"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {ver ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="db-field">
        <label className="db-label" htmlFor="mt-confirmar">
          Confirmar contraseña
        </label>
        <input
          id="mt-confirmar"
          type={tipoInput}
          className="db-input"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          minLength={8}
          autoComplete="new-password"
          placeholder="Repite la nueva contraseña"
        />
      </div>

      <ul className="mt-pass-requisitos">
        <li>Mínimo 8 caracteres</li>
        <li>Una mayúscula y una minúscula</li>
        <li>Un número</li>
        <li>Un carácter especial</li>
      </ul>

      <button type="submit" className="db-btn-primary mt-pass-btn">
        Guardar contraseña
      </button>

      {aviso && (
        <p className={aviso.tipo === "error" ? "mt-pass-aviso mt-pass-aviso-error" : "mt-pass-aviso"} role="status">
          {aviso.texto}
        </p>
      )}
    </form>
  );
}
