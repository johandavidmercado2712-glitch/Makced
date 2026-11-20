import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartToast } from "./CartToast";

describe("CartToast", () => {
  it("no renderiza nada cuando visible es false", () => {
    const { container } = render(
      <CartToast visible={false} message="Hola" onDismiss={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza el mensaje cuando visible es true", () => {
    render(
      <CartToast visible={true} message="Producto añadido" onDismiss={vi.fn()} />,
    );

    expect(screen.getByText("Producto añadido")).toBeInTheDocument();
  });

  it("variant celebration muestra icono de celebración y confetti", async () => {
    render(
      <CartToast
        visible={true}
        message="¡Pedido realizado!"
        variant="celebration"
        onDismiss={vi.fn()}
      />,
    );

    // Verificar que existe el icono de celebración (PartyPopper de lucide)
    const icon = document.querySelector(".cart-toast-icon--celebration");
    expect(icon).not.toBeNull();

    // Verificar confetti (aparece tras setTimeout(0))
    await vi.waitFor(() => {
      const confetti = document.querySelector(".cart-toast-confetti");
      expect(confetti).not.toBeNull();
    });
  });

  it("variant success muestra icono de éxito", () => {
    render(
      <CartToast
        visible={true}
        message="Guardado"
        variant="success"
        onDismiss={vi.fn()}
      />,
    );

    const icon = document.querySelector(".cart-toast-icon--success");
    expect(icon).not.toBeNull();
  });

  it("variant undo muestra botón Deshacer con countdown", () => {
    render(
      <CartToast
        visible={true}
        message="Producto eliminado"
        variant="undo"
        countdown={3}
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Deshacer (3)" }),
    ).toBeInTheDocument();
  });

  it("click en Deshacer llama onUndo", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();

    render(
      <CartToast
        visible={true}
        message="Producto eliminado"
        variant="undo"
        countdown={3}
        onUndo={onUndo}
        onDismiss={vi.fn()}
      />,
    );

    const btnUndo = screen.getByRole("button", { name: "Deshacer (3)" });
    await user.click(btnUndo);

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("click en Cerrar llama onDismiss", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <CartToast
        visible={true}
        message="Producto añadido"
        onDismiss={onDismiss}
      />,
    );

    const btnCerrar = screen.getByRole("button", { name: "Cerrar" });
    await user.click(btnCerrar);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("tiene atributos de accesibilidad correctos", () => {
    render(
      <CartToast
        visible={true}
        message="Mensaje accesible"
        onDismiss={vi.fn()}
      />,
    );

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
  });
});
