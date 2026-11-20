import { Store } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface OnboardingPanelProps {
  pasosCompletados: number;
  progreso: {
    marcas: boolean;
    categorias: boolean;
    productos: boolean;
  };
}

export default function OnboardingPanel({ pasosCompletados, progreso }: OnboardingPanelProps) {
  const label =
    pasosCompletados === 0
      ? "Comencemos"
      : pasosCompletados === 1
        ? "¡Buen comienzo!"
        : pasosCompletados === 2
          ? "¡Casi listo!"
          : "¡Tu catálogo está completo!";

  return (
    <section className="db-panel db-onboard-panel">
      <EmptyState
        icon={Store}
        titulo="Bienvenida a tu panel de administracion"
        descripcion="Tu tienda esta lista, pero tu catalogo necesita productos. Sigue estos pasos para tener tu tienda online funcionando."
      />

      {/* Barra de progreso */}
      <div className="db-onboard-progress">
        <div className="db-onboard-progress-header">
          <span className="db-onboard-progress-label">{label}</span>
          <span className="db-onboard-progress-count">{pasosCompletados}/3</span>
        </div>
        <div className="db-onboard-progress-bar">
          <div
            className="db-onboard-progress-fill"
            style={{ width: `${(pasosCompletados / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Pasos */}
      <div className="db-onboard-steps">
        <div className={`db-onboard-step ${progreso.marcas ? "db-onboard-step--done" : ""}`}>
          <span className="db-onboard-step-number">1</span>
          <div className="db-onboard-step-content">
            <h3>Crear marcas</h3>
            <p>Agrega las marcas de tus productos</p>
          </div>
        </div>
        <div className={`db-onboard-step ${progreso.categorias ? "db-onboard-step--done" : ""}`}>
          <span className="db-onboard-step-number">2</span>
          <div className="db-onboard-step-content">
            <h3>Crear categorías</h3>
            <p>Organiza tus productos en categorías</p>
          </div>
        </div>
        <div className={`db-onboard-step ${progreso.productos ? "db-onboard-step--done" : ""}`}>
          <span className="db-onboard-step-number">3</span>
          <div className="db-onboard-step-content">
            <h3>Agregar productos</h3>
            <p>Sube tus productos al catálogo</p>
          </div>
        </div>
      </div>
    </section>
  );
}
