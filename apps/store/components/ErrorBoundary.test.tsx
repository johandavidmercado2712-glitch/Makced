import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "./ErrorBoundary";

function ChildSafe() {
  return <p>Contenido seguro</p>;
}

function ChildWithError() {
  throw new Error("Error de prueba");
  return null; // eslint-disable-line no-unreachable
}

// Silenciar el console.error que dispara React en los errores de prueba
const consoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("ErrorBoundary", () => {
  it("renderiza los children cuando no hay error", () => {
    render(
      <ErrorBoundary>
        <ChildSafe />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Contenido seguro")).toBeInTheDocument();
  });

  it("muestra el fallback por defecto cuando un hijo lanza un error", () => {
    render(
      <ErrorBoundary>
        <ChildWithError />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(
      screen.getByText(/Hubo un problema al cargar esta sección/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Contenido seguro")).not.toBeInTheDocument();
  });

  it("renderiza un fallback personalizado cuando se proporciona", () => {
    render(
      <ErrorBoundary fallback={<p>Fallback custom</p>}>
        <ChildWithError />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Fallback custom")).toBeInTheDocument();
    expect(screen.queryByText("Algo salió mal")).not.toBeInTheDocument();
  });

  it("el botón Reintentar resetea el estado", async () => {
    const user = userEvent.setup();

    // Componente que controla el error desde fuera
    let shouldThrow = true;
    function ChildConditional() {
      if (shouldThrow) throw new Error("Error de prueba");
      return <p>Contenido recuperado</p>;
    }

    render(
      <ErrorBoundary>
        <ChildConditional />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();

    // Simular que el error se resolvió antes de reintentar
    shouldThrow = false;

    const btnReintentar = screen.getByRole("button", { name: "Reintentar" });
    await user.click(btnReintentar);

    expect(screen.getByText("Contenido recuperado")).toBeInTheDocument();
  });
});
