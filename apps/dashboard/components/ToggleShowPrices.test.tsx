import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToggleShowPrices from "./ToggleShowPrices";

describe("ToggleShowPrices", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza el switch con estado inicial true", () => {
    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute("aria-checked", "true");
    expect(switchBtn).not.toBeDisabled();
  });

  it("renderiza el switch con estado inicial false", () => {
    render(<ToggleShowPrices initial={false} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    expect(switchBtn).toHaveAttribute("aria-checked", "false");
  });

  it("muestra 'Guardado' cuando el toggle es exitoso", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, mostrar_precios: false }),
    } as Response);

    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    await user.click(switchBtn);

    await waitFor(() => {
      expect(screen.getByText("Guardado")).toBeInTheDocument();
    });

    expect(switchBtn).toHaveAttribute("aria-checked", "false");
  });

  it("muestra mensaje de error 401 (sesión expirada)", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    await user.click(switchBtn);

    await waitFor(() => {
      expect(screen.getByText("Sesión expirada. Inicia sesión de nuevo.")).toBeInTheDocument();
    });
  });

  it("muestra mensaje de error 403 (sin permiso)", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);

    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    await user.click(switchBtn);

    await waitFor(() => {
      expect(screen.getByText("No tienes permiso para cambiar este ajuste.")).toBeInTheDocument();
    });
  });

  it("muestra mensaje de error genérico para otros status", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    await user.click(switchBtn);

    await waitFor(() => {
      expect(screen.getByText("Error del servidor (500)")).toBeInTheDocument();
    });
  });

  it("muestra mensaje de error de conexión cuando fetch falla", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    await user.click(switchBtn);

    await waitFor(() => {
      expect(screen.getByText("Error de conexión. Revisa tu internet.")).toBeInTheDocument();
    });
  });

  it("muestra error cuando la respuesta no tiene ok", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false, error: "DB error" }),
    } as Response);

    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    await user.click(switchBtn);

    await waitFor(() => {
      expect(screen.getByText("Error: DB error")).toBeInTheDocument();
    });
  });

  it("el switch se desactiva durante la carga", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: Response) => void;
    const promise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });
    vi.spyOn(global, "fetch").mockReturnValueOnce(promise);

    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    await user.click(switchBtn);

    expect(switchBtn).toBeDisabled();
    expect(switchBtn).toHaveAttribute("aria-busy", "true");

    // Resolver la promesa
    resolvePromise!({
      ok: true,
      json: async () => ({ ok: true, mostrar_precios: false }),
    } as Response);

    await waitFor(() => {
      expect(switchBtn).not.toBeDisabled();
    });
  });

  it("muestra el texto de estado visible según el valor", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, mostrar_precios: false }),
    } as Response);

    render(<ToggleShowPrices initial={true} />);

    expect(screen.getByText("Activado")).toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: "Mostrar precios en tienda" }));

    await waitFor(() => {
      expect(screen.getByText("Desactivado")).toBeInTheDocument();
    });
  });

  it("aplica el cambio de forma optimista y revierte si el servidor falla", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: Response) => void;
    const promise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });
    vi.spyOn(global, "fetch").mockReturnValueOnce(promise);

    render(<ToggleShowPrices initial={true} />);

    const switchBtn = screen.getByRole("switch", { name: "Mostrar precios en tienda" });
    await user.click(switchBtn);

    // El knob ya se movió antes de que el servidor responda.
    expect(switchBtn).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Desactivado")).toBeInTheDocument();

    resolvePromise!({ ok: false, status: 500 } as Response);

    await waitFor(() => {
      expect(switchBtn).toHaveAttribute("aria-checked", "true");
    });
    expect(screen.getByText("Error del servidor (500)")).toBeInTheDocument();
    expect(screen.getByText("Activado")).toBeInTheDocument();
  });
});
