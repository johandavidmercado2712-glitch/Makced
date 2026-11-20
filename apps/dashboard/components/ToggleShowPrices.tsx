"use client";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

export default function ToggleShowPrices({ initial = true }: { initial?: boolean }) {
  const [checked, setChecked] = useState<boolean>(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function toggle() {
    const siguiente = !checked;
    // Optimista: el knob se mueve al instante; si el servidor falla, se revierte.
    setChecked(siguiente);
    setLoading(true);
    setMessage(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try {
      const res = await fetch('/api/settings/mostrar-precios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show: siguiente }),
      });
      // fetch() no rechaza en 4xx/5xx: hay que verificar el status antes del json().
      if (!res.ok) {
        setChecked(!siguiente);
        if (res.status === 401) {
          setMessage('Sesión expirada. Inicia sesión de nuevo.');
        } else if (res.status === 403) {
          setMessage('No tienes permiso para cambiar este ajuste.');
        } else {
          setMessage(`Error del servidor (${res.status})`);
        }
        return;
      }
      const json = await res.json();
      if (json?.ok) {
        setChecked(Boolean(json.mostrar_precios));
        setMessage('Guardado');
      } else {
        setChecked(!siguiente);
        setMessage(json?.error ? `Error: ${json.error}` : 'Error al guardar');
      }
    } catch {
      // Solo llega aquí en errores de red o JSON inválido.
      setChecked(!siguiente);
      setMessage('Error de conexión. Revisa tu internet.');
    } finally {
      setLoading(false);
      timeoutRef.current = setTimeout(() => setMessage(null), 2000);
    }
  }

  return (
    <div className="toggle-precios">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-busy={loading}
        aria-label="Mostrar precios en tienda"
        className={`toggle-precios-switch${checked ? " toggle-precios-switch--on" : ""}`}
        onClick={toggle}
        disabled={loading}
      >
        <span className="toggle-precios-thumb">
          <Check size={12} strokeWidth={3} aria-hidden="true" />
        </span>
      </button>
      <span className="toggle-precios-label">Mostrar precios en tienda</span>
      <span
        className={`toggle-precios-state${checked ? " toggle-precios-state--on" : ""}`}
        aria-hidden="true"
      >
        {checked ? "Activado" : "Desactivado"}
      </span>
      {message && (
        <span
          className={`toggle-precios-msg${message === "Guardado" ? "" : " toggle-precios-msg--error"}`}
          role="status"
        >
          {message}
        </span>
      )}
    </div>
  );
}
