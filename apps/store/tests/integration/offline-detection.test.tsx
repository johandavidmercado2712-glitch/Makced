import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { OfflineBanner, useOnlineStatus } from "../../components/OfflineBanner";

function mockNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    value,
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  mockNavigatorOnline(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Detección de conexión (integración)", () => {
  it("no muestra banner cuando el navegador está online", async () => {
    render(<OfflineBanner />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra banner cuando el navegador está offline", async () => {
    mockNavigatorOnline(false);
    render(<OfflineBanner />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const banner = screen.getByRole("alert");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(
      "Sin conexión. Algunos datos pueden no estar actualizados.",
    );
  });

  it("banner desaparece cuando se recupera la conexión", async () => {
    mockNavigatorOnline(false);
    render(<OfflineBanner />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Simular recuperación de conexión
    mockNavigatorOnline(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("banner aparece cuando se pierde la conexión", async () => {
    render(<OfflineBanner />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // Simular pérdida de conexión
    mockNavigatorOnline(false);
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("banner contiene icono de wifi-off", async () => {
    mockNavigatorOnline(false);
    render(<OfflineBanner />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const banner = screen.getByRole("alert");
    const icon = banner.querySelector("svg");
    expect(icon).not.toBeNull();
  });

  it("useOnlineStatus hook responde a cambios de conexión", async () => {
    const { result } = renderHook(() => useOnlineStatus());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(result.current).toBe(true);

    mockNavigatorOnline(false);
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);

    mockNavigatorOnline(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });

  it("múltiples cambios de conexión se manejan correctamente", async () => {
    const { result } = renderHook(() => useOnlineStatus());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(result.current).toBe(true);

    // Simular múltiples cambios
    mockNavigatorOnline(false);
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);

    mockNavigatorOnline(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);

    mockNavigatorOnline(false);
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
  });
});
