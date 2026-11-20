import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast } from "./Toast";
import type { UndoToastState } from "@/hooks/useUndoToast";

const estadoBase: UndoToastState = {
  visible: false,
  message: "",
  countdown: 0,
  undoAction: null,
};

describe("Toast", () => {
  it("no renderiza nada cuando visible es false", () => {
    const { container } = render(
      <Toast state={estadoBase} onUndo={vi.fn()} onDismiss={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza el mensaje cuando visible es true", () => {
    render(
      <Toast
        state={{ ...estadoBase, visible: true, message: "Producto eliminado" }}
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText("Producto eliminado")).toBeInTheDocument();
  });

  it("tiene atributos de accesibilidad correctos", () => {
    render(
      <Toast
        state={{ ...estadoBase, visible: true, message: "Mensaje" }}
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
  });

  it("muestra botón Deshacer cuando hay undoAction", () => {
    render(
      <Toast
        state={{
          ...estadoBase,
          visible: true,
          message: "Eliminado",
          undoAction: async () => {},
          countdown: 5,
        }}
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Deshacer \(5\)/ })).toBeInTheDocument();
  });

  it("no muestra botón Deshacer cuando no hay undoAction", () => {
    render(
      <Toast
        state={{ ...estadoBase, visible: true, message: "Eliminado" }}
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /Deshacer/ })).not.toBeInTheDocument();
  });

  it("click en Deshacer llama onUndo", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();

    render(
      <Toast
        state={{
          ...estadoBase,
          visible: true,
          message: "Eliminado",
          undoAction: async () => {},
          countdown: 3,
        }}
        onUndo={onUndo}
        onDismiss={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Deshacer \(3\)/ }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("click en Cerrar llama onDismiss", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Toast
        state={{ ...estadoBase, visible: true, message: "Mensaje" }}
        onUndo={vi.fn()}
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("variant celebration muestra icono de celebración", () => {
    render(
      <Toast
        state={{ ...estadoBase, visible: true, message: "¡Éxito!" }}
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
        variant="celebration"
      />,
    );

    const icon = document.querySelector(".db-toast-celebration-icon");
    expect(icon).not.toBeNull();
  });

  it("aplica clase de pulso cuando countdown <= 2", () => {
    render(
      <Toast
        state={{
          ...estadoBase,
          visible: true,
          message: "Eliminado",
          undoAction: async () => {},
          countdown: 2,
        }}
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    const btnUndo = screen.getByRole("button", { name: /Deshacer \(2\)/ });
    expect(btnUndo).toHaveClass("db-toast-btn-pulse");
  });
});
