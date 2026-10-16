"use client";

import type { EditorDisenoApi } from "./comunes";
import { Contador } from "./Contador";

export function PanelPie({ api }: { api: EditorDisenoApi }) {
  const { borrador, setPie } = api;

  return (
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
  );
}
