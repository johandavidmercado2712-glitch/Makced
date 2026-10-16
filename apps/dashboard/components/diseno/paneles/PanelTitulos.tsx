"use client";

import type { EditorDisenoApi } from "./comunes";
import { Contador } from "./Contador";

export function PanelTitulos({ api }: { api: EditorDisenoApi }) {
  const { borrador, setTitulos } = api;

  return (
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
  );
}
