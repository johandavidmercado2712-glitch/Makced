import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutForm from "./CheckoutForm";

beforeEach(() => {
  localStorage.clear();
});

describe("CheckoutForm", () => {
  it("renderiza los 4 campos del formulario", () => {
    render(<CheckoutForm onValidChange={vi.fn()} />);

    expect(screen.getByLabelText(/Nombre completo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección de entrega/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notas adicionales/)).toBeInTheDocument();
  });

  it("muestra asterisco (*) en campos obligatorios", () => {
    render(<CheckoutForm onValidChange={vi.fn()} />);

    const nombreLabel = screen.getByLabelText(/Nombre completo/);
    const telefonoLabel = screen.getByLabelText(/Teléfono/);
    const direccionLabel = screen.getByLabelText(/Dirección de entrega/);

    expect(nombreLabel.closest("div")?.querySelector(".checkout-required")).toHaveTextContent("*");
    expect(telefonoLabel.closest("div")?.querySelector(".checkout-required")).toHaveTextContent("*");
    expect(direccionLabel.closest("div")?.querySelector(".checkout-required")).toHaveTextContent("*");

    const notasLabel = screen.getByLabelText(/Notas adicionales/);
    expect(notasLabel.closest("div")?.querySelector(".checkout-required")).toBeNull();
  });

  it("llama onValidChange con false cuando los campos obligatorios están vacíos", async () => {
    const onValidChange = vi.fn();
    const user = userEvent.setup();
    render(<CheckoutForm onValidChange={onValidChange} />);

    // Escribir en un campo para disparar la validación
    const nombreInput = screen.getByLabelText(/Nombre completo/);
    await user.type(nombreInput, "a");

    await waitFor(() => {
      expect(onValidChange).toHaveBeenCalled();
    });

    // Debe ser false porque los campos obligatorios están vacíos
    const ultimaLlamada = onValidChange.mock.calls[onValidChange.mock.calls.length - 1];
    expect(ultimaLlamada[1]).toBe(false);
  });

  it("llama onValidChange con true cuando los datos son válidos", async () => {
    const onValidChange = vi.fn();
    const user = userEvent.setup();

    render(<CheckoutForm onValidChange={onValidChange} />);

    const nombreInput = screen.getByLabelText(/Nombre completo/);
    const telefonoInput = screen.getByLabelText(/Teléfono/);
    const direccionInput = screen.getByLabelText(/Dirección de entrega/);

    await user.type(nombreInput, "María García");
    await user.type(telefonoInput, "3001234567");
    await user.type(direccionInput, "Calle 123 #45-67, Barrio Centro");

    await waitFor(() => {
      const ultimaLlamada = onValidChange.mock.calls[onValidChange.mock.calls.length - 1];
      expect(ultimaLlamada[1]).toBe(true);
    });

    // Verificar que los datos correctos se pasaron
    const ultimaLlamada = onValidChange.mock.calls[onValidChange.mock.calls.length - 1];
    expect(ultimaLlamada[0]).toEqual({
      nombre: "María García",
      telefono: "3001234567",
      direccion: "Calle 123 #45-67, Barrio Centro",
      notas: "",
    });
  });

  it("muestra error de validación al hacer blur en nombre inválido", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm onValidChange={vi.fn()} />);

    const nombreInput = screen.getByLabelText(/Nombre completo/);
    await user.type(nombreInput, "ab");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByRole("alert"),
      ).toHaveTextContent("El nombre debe tener al menos 3 caracteres");
    });
  });

  it("guarda datos válidos en localStorage", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm onValidChange={vi.fn()} />);

    const nombreInput = screen.getByLabelText(/Nombre completo/);
    const telefonoInput = screen.getByLabelText(/Teléfono/);
    const direccionInput = screen.getByLabelText(/Dirección de entrega/);

    await user.type(nombreInput, "Juan Pérez");
    await user.type(telefonoInput, "3109876543");
    await user.type(direccionInput, "Carrera 45 #12-34, Chapinero");

    await waitFor(() => {
      const guardado = localStorage.getItem("checkout-datos");
      expect(guardado).not.toBeNull();
      const datos = JSON.parse(guardado!);
      expect(datos.nombre).toBe("Juan Pérez");
      expect(datos.telefono).toBe("3109876543");
    });
  });

  it("no guarda en localStorage cuando hay errores de validación", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm onValidChange={vi.fn()} />);

    const nombreInput = screen.getByLabelText(/Nombre completo/);
    await user.type(nombreInput, "ab");

    // Hacer blur para activar la validación
    await user.tab();

    // Esperar un momento para que el useEffect se ejecute
    await waitFor(() => {
      const guardado = localStorage.getItem("checkout-datos");
      expect(guardado).toBeNull();
    });
  });

  it("precarga datos desde initialData", () => {
    render(
      <CheckoutForm
        onValidChange={vi.fn()}
        initialData={{
          nombre: "Carlos López",
          telefono: "3151234567",
        }}
      />,
    );

    const nombreInput = screen.getByLabelText(/Nombre completo/) as HTMLInputElement;
    const telefonoInput = screen.getByLabelText(/Teléfono/) as HTMLInputElement;

    expect(nombreInput.value).toBe("Carlos López");
    expect(telefonoInput.value).toBe("3151234567");
  });
});
