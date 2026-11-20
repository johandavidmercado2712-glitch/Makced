import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { OfflineBanner, useOnlineStatus } from "./OfflineBanner";

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

describe("OfflineBanner", () => {
  it("no renderiza nada cuando está online", async () => {
    const { container } = render(<OfflineBanner />);

    // Esperar el setTimeout(0) del useEffect
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(container.firstChild).toBeNull();
  });

  it("renderiza el banner cuando está offline", async () => {
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

  it("el banner contiene el icono de wifi-off", async () => {
    mockNavigatorOnline(false);
    render(<OfflineBanner />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const banner = screen.getByRole("alert");
    const icon = banner.querySelector("svg");
    expect(icon).not.toBeNull();
  });
});

describe("useOnlineStatus", () => {
  it("retorna true cuando el navegador está online", async () => {
    const { result } = renderHook(() => useOnlineStatus());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current).toBe(true);
  });

  it("retorna false cuando el navegador está offline", async () => {
    mockNavigatorOnline(false);
    const { result } = renderHook(() => useOnlineStatus());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current).toBe(false);
  });

  it("responde al evento offline", async () => {
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
  });

  it("responde al evento online", async () => {
    mockNavigatorOnline(false);
    const { result } = renderHook(() => useOnlineStatus());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(result.current).toBe(false);

    mockNavigatorOnline(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current).toBe(true);
  });
});
