import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renderiza icono, título y descripción", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="No encontramos lo que buscas"
      />,
    );

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(screen.getByText("No encontramos lo que buscas")).toBeInTheDocument();
    expect(document.querySelector("svg")).not.toBeNull();
  });

  it("renderiza CTA cuando se proporciona", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
        cta={<button>Acción</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Acción" })).toBeInTheDocument();
  });

  it("no renderiza CTA cuando no se proporciona", () => {
    const { container } = render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
      />,
    );

    expect(container.querySelector(".db-empty-action")).toBeNull();
  });

  it("renderiza paso cuando se proporciona", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
        paso={{ numero: 1, total: 3, texto: "Primer paso" }}
      />,
    );

    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
  });

  it("no renderiza paso cuando no se proporciona", () => {
    const { container } = render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
      />,
    );

    expect(container.querySelector(".db-empty-paso")).toBeNull();
  });
});
