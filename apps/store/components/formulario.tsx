"use client";
import { X } from "lucide-react";
import "./formulario.css";

interface Props {
  onClose: () => void;
}

export default function Formulario({ onClose }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    console.log("Login:", email, password);
    alert("Funcionalidad de login próximamente");
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose} aria-label="Cerrar formulario">
          <X size={20} />
        </button>

        <h2>Iniciar Sesión</h2>
        <p>¿No tienes cuenta? Créala gratis</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Correo electrónico</label>
            <input id="login-email" type="email" name="email" placeholder="Email" />
          </div>
          <div className="login-field">
            <div className="login-field-header">
              <label htmlFor="login-password">Contraseña</label>
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
            <input id="login-password" type="password" name="password" placeholder="Contraseña" />
          </div>
          <button type="submit" className="login-submit">Iniciar Sesión</button>
        </form>

        <div className="login-divider"><span>o</span></div>

        <button className="login-google" type="button">
          <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="login-google-icon">
            <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
          </svg>
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
