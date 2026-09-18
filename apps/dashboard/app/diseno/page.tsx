import {
  RotateCcw,
  ExternalLink,
  Paintbrush,
  Image,
  PanelTop,
  Megaphone,
  Type,
  FileText,
  Lightbulb,
} from "lucide-react";
import "./diseno.css";

const tabs = [
  { id: "estilo", label: "Estilo global", icon: Paintbrush },
  { id: "logo", label: "Logo", icon: Image },
  { id: "banner", label: "Banner principal", icon: PanelTop },
  { id: "promo", label: "Banner promocional", icon: Megaphone },
  { id: "titulos", label: "H₁ Títulos de secciones", icon: Type },
  { id: "pie", label: "Pie de página", icon: FileText },
];

const palettes = [
  { name: "Turquesa", color: "#00d2b4", active: true },
  { name: "Violeta", color: "#7C53ED" },
  { name: "Naranja", color: "#F97316" },
  { name: "Rosa", color: "#EC4899" },
  { name: "Azul", color: "#3B82F6" },
  { name: "Rojo", color: "#EF4444" },
  { name: "Verde", color: "#22C55E" },
  { name: "Grafito", color: "#6B7280" },
];

export default function DisenoPage() {
  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <h1 className="db-title">Editor de estilos y contenido</h1>
          <p className="db-subtitle">
            Personaliza colores, textos, logo e imágenes de la tienda.
            Los cambios se guardan automáticamente y se ven al instante.
          </p>
        </div>
        <div className="db-header-actions">
          <button className="db-btn-secondary">
            <RotateCcw size={16} /> Restaurar todo
          </button>
          <button className="db-btn-primary">
            <ExternalLink size={16} /> Ver tienda
          </button>
        </div>
      </div>

      <div className="de-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`de-tab ${tab.id === "estilo" ? "de-tab-active" : ""}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="de-content">
        <div className="de-left">
          <div className="db-panel">
            <div className="de-section-header">
              <Paintbrush size={18} />
              <div>
                <h2 className="de-section-title">Estilo global</h2>
                <p className="de-section-desc">
                  Afecta TODA la tienda: botones, enlaces, precios, iconos y esquinas de las tarjetas.
                </p>
              </div>
            </div>

            <div className="de-subsection">
              <h3 className="de-subsection-title">PALETAS RÁPIDAS</h3>
              <div className="de-palettes">
                {palettes.map((p) => (
                  <button
                    key={p.name}
                    className={`de-palette ${p.active ? "de-palette-active" : ""}`}
                  >
                    <span
                      className="de-palette-color"
                      style={{ background: p.color }}
                    />
                    <span className="de-palette-name">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="de-colors">
              <div className="de-color-field">
                <h3 className="de-subsection-title">COLOR PRINCIPAL</h3>
                <div className="de-color-input">
                  <span className="de-color-swatch" style={{ background: "#00d2b4" }} />
                  <span className="de-color-hex">#00d2b4</span>
                </div>
              </div>
              <div className="de-color-field">
                <h3 className="de-subsection-title">COLOR SECUNDARIO (DEGRADADO)</h3>
                <div className="de-color-input">
                  <span className="de-color-swatch" style={{ background: "#4ce1ac" }} />
                  <span className="de-color-hex">#4ce1ac</span>
                </div>
              </div>
            </div>

            <div className="de-subsection">
              <h3 className="de-subsection-title">REDONDEO DE ESQUINAS</h3>
              <div className="de-slider">
                <input
                  type="range"
                  min="0"
                  max="175"
                  defaultValue="75"
                  className="de-range"
                />
                <span className="de-slider-value">0.75rem</span>
              </div>
              <p className="de-slider-hint">
                De cuadrado (0) a muy redondeado (1.75rem)
              </p>
            </div>

            <div className="de-subsection">
              <h3 className="de-subsection-title">TIPOGRAFÍA</h3>
              <div className="de-dropdown">
                <span>Inter</span>
                <span className="de-dropdown-arrow">▾</span>
              </div>
            </div>
          </div>
        </div>

        <div className="de-right">
          <div className="db-panel de-preview-card">
            <div className="de-preview-image">
              <div className="de-preview-placeholder">
                <Image size={32} />
              </div>
            </div>
            <h3 className="de-preview-title">Colores y estilo global</h3>
            <p className="de-preview-desc">
              Afecta TODA la tienda: botones, enlaces, precios, iconos y esquinas de las tarjetas.
            </p>
          </div>

          <div className="db-panel de-preview-card">
            <div className="de-live-header">
              <span className="de-live-badge">VISTA PREVIA EN VIVO</span>
              <a href="#" className="de-live-link">Abrir ↗</a>
            </div>
            <div className="de-live-image">
              <div className="de-live-placeholder">
                <Image size={32} />
              </div>
            </div>
            <p className="de-preview-desc">
              Así se ve la sección estilo global con tus cambios actuales.
            </p>
          </div>

          <div className="db-panel de-help-card">
            <div className="de-help-icon">
              <Lightbulb size={20} />
            </div>
            <h3 className="de-help-title">Cómo funciona</h3>
            <p className="de-help-text">
              Cada cambio se aplica y guarda al instante (localStorage del navegador).
              Usa Restaurar todo para volver a los valores originales de MAKCED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
