import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Store } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import OnboardingPanel from "@/components/OnboardingPanel";

describe("Flujo de Onboarding (integración)", () => {
  it("EmptyState renderiza icono, título y descripción", () => {
    render(
      <EmptyState
        icon={Store}
        titulo="Bienvenida a tu panel"
        descripcion="Tu tienda está lista"
      />,
    );

    expect(screen.getByText("Bienvenida a tu panel")).toBeInTheDocument();
    expect(screen.getByText("Tu tienda está lista")).toBeInTheDocument();
    expect(document.querySelector("svg")).not.toBeNull();
  });

  it("EmptyState renderiza CTA cuando se proporciona", () => {
    render(
      <EmptyState
        icon={Store}
        titulo="Sin productos"
        descripcion="Agrega tu primer producto"
        cta={<button>Ir a productos</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Ir a productos" })).toBeInTheDocument();
  });

  it("EmptyState renderiza paso cuando se proporciona", () => {
    render(
      <EmptyState
        icon={Store}
        titulo="Sin productos"
        descripcion="Agrega tu primer producto"
        paso={{ numero: 1, total: 3, texto: "Primer paso" }}
      />,
    );

    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
  });

  it("OnboardingPanel renderiza pasos de onboarding", () => {
    render(
      <OnboardingPanel
        pasosCompletados={1}
        progreso={{ marcas: true, categorias: false, productos: false }}
      />,
    );

    expect(screen.getByText("¡Buen comienzo!")).toBeInTheDocument();
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("OnboardingPanel muestra progreso completo", () => {
    render(
      <OnboardingPanel
        pasosCompletados={3}
        progreso={{ marcas: true, categorias: true, productos: true }}
      />,
    );

    expect(screen.getByText("¡Tu catálogo está completo!")).toBeInTheDocument();
    expect(screen.getByText("3/3")).toBeInTheDocument();
  });

  it("OnboardingPanel muestra progreso inicial", () => {
    render(
      <OnboardingPanel
        pasosCompletados={0}
        progreso={{ marcas: false, categorias: false, productos: false }}
      />,
    );

    expect(screen.getByText("Comencemos")).toBeInTheDocument();
    expect(screen.getByText("0/3")).toBeInTheDocument();
  });
});
