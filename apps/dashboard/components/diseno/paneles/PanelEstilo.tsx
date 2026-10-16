"use client";

import { TIPOGRAFIAS, type Tipografia } from "@makced/db/diseno";
import { HEX, PALETAS, type EditorDisenoApi } from "./comunes";

export function PanelEstilo({ api }: { api: EditorDisenoApi }) {
  const { borrador, colorP, setColorP, setCampo, marcarCambio } = api;

  return (
    <>
      <div className="de-subsection de-grid-full">
        <h3 className="de-subsection-title">PALETAS RÁPIDAS</h3>
        <div className="de-palettes">
          {PALETAS.map((p) => (
            <button
              key={p.nombre}
              type="button"
              className={
                colorP === p.principal && borrador.color_secundario === p.secundario
                  ? "de-palette de-palette-active"
                  : "de-palette"
              }
              onClick={() => {
                setColorP(p.principal);
                setCampo("color_secundario", p.secundario);
              }}
            >
              <span
                className="de-palette-color"
                style={{ background: p.principal }}
              />
              <span className="de-palette-name">{p.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="de-colors de-grid-full">
        <div className="db-field">
          <label className="db-label" htmlFor="de-color-principal">
            Color principal
          </label>
          <div className="de-color-input">
            <label
              className="de-color-swatch"
              style={{ background: HEX.test(colorP) ? colorP : "#94A3B8" }}
            >
              <input
                type="color"
                value={HEX.test(colorP) ? colorP : "#000000"}
                onChange={(e) => {
                  setColorP(e.target.value);
                  marcarCambio();
                }}
                aria-label="Elegir color principal"
              />
            </label>
            <input
              id="de-color-principal"
              name="color_principal"
              className="db-input de-color-hex"
              value={colorP}
              onChange={(e) => {
                setColorP(e.target.value);
                marcarCambio();
              }}
              pattern="#[0-9a-fA-F]{6}"
              title="Usa el formato #AABBCC"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="db-field">
          <label className="db-label" htmlFor="de-color-secundario">
            Color secundario
          </label>
          <div className="de-color-input">
            <label
              className="de-color-swatch"
              style={{
                background: HEX.test(borrador.color_secundario)
                  ? borrador.color_secundario
                  : "#94A3B8",
              }}
            >
              <input
                type="color"
                value={
                  HEX.test(borrador.color_secundario)
                    ? borrador.color_secundario
                    : "#000000"
                }
                onChange={(e) =>
                  setCampo("color_secundario", e.target.value)
                }
                aria-label="Elegir color secundario"
              />
            </label>
            <input
              id="de-color-secundario"
              name="color_secundario"
              className="db-input de-color-hex"
              value={borrador.color_secundario}
              onChange={(e) => setCampo("color_secundario", e.target.value)}
              pattern="#[0-9a-fA-F]{6}"
              title="Usa el formato #AABBCC"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="db-field">
        <label className="db-label" htmlFor="de-tipografia">
          Tipografía
        </label>
        <select
          id="de-tipografia"
          name="tipografia"
          className="db-select"
          value={borrador.tipografia}
          onChange={(e) => setCampo("tipografia", e.target.value as Tipografia)}
        >
          {TIPOGRAFIAS.map((familia) => (
            <option key={familia} value={familia}>
              {familia}
            </option>
          ))}
        </select>
      </div>

      <div className="db-field">
        <label className="db-label" htmlFor="de-radio">
          Redondeo de esquinas
        </label>
        <div className="de-slider">
          <input
            id="de-radio"
            name="radio"
            type="range"
            min={0}
            max={24}
            step={1}
            className="de-range"
            value={borrador.radio}
            onChange={(e) => setCampo("radio", Number(e.target.value))}
          />
          <span className="de-slider-value">{borrador.radio} px</span>
        </div>
        <p className="de-slider-hint">De cuadrado (0 px) a muy redondeado (24 px)</p>
      </div>
    </>
  );
}
