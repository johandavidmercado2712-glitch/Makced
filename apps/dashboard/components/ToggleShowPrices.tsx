"use client";
import { useState } from "react";

export default function ToggleShowPrices({ initial = true }: { initial?: boolean }) {
  const [checked, setChecked] = useState<boolean>(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings/mostrar-precios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show: !checked }),
      });
      // fetch() no rechaza en 4xx/5xx: hay que verificar el status antes del json().
      if (!res.ok) {
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
        setMessage(json?.error ? `Error: ${json.error}` : 'Error al guardar');
      }
    } catch (err) {
      // Solo llega aquí en errores de red o JSON inválido.
      setMessage('Error de conexión. Revisa tu internet.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 2000);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={toggle}
          disabled={loading}
        />
        <span>Mostrar precios en tienda</span>
      </label>
      {message && <span style={{ fontSize: 12 }}>{message}</span>}
    </div>
  );
}
