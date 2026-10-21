import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

function definirMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

async function montar() {
  const { ThemeProvider, useTheme } = await import("./ThemeProvider");

  function Consumidor() {
    const { theme, setTheme } = useTheme();
    return (
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme}
      </button>
    );
  }

  return render(
    <ThemeProvider>
      <Consumidor />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  definirMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ThemeProvider", () => {
  it("usa el tema guardado en localStorage", async () => {
    localStorage.setItem("theme", "dark");
    await montar();

    expect(screen.getByRole("button")).toHaveTextContent("dark");
    await waitFor(() =>
      expect(document.documentElement).toHaveClass("dark"),
    );
  });

  it("parte del sistema y persiste el cambio al alternar", async () => {
    const user = userEvent.setup();
    await montar();

    expect(screen.getByRole("button")).toHaveTextContent("light");
    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    await waitFor(() =>
      expect(document.documentElement).toHaveClass("dark"),
    );
  });

  it("sigue funcionando con localStorage bloqueado", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage bloqueado");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage bloqueado");
    });

    const user = userEvent.setup();
    await montar();

    expect(screen.getByRole("button")).toHaveTextContent("light");
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("dark");
    await waitFor(() =>
      expect(document.documentElement).toHaveClass("dark"),
    );
  });

  it("cae a light si matchMedia no está disponible", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn(() => {
        throw new Error("sin matchMedia");
      }),
    });

    await montar();
    expect(screen.getByRole("button")).toHaveTextContent("light");
  });
});
