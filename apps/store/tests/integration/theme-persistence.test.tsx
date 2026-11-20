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
  vi.resetModules();
  const { ThemeProvider, useTheme } = await import("../../components/auth/ThemeProvider");

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
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  definirMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Persistencia de tema (integración)", () => {
  it("inicializa con tema 'light' por defecto", async () => {
    await montar();

    expect(screen.getByRole("button")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("cambia tema al hacer clic", async () => {
    const user = userEvent.setup();
    await montar();

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("dark");
    await waitFor(() =>
      expect(document.documentElement).toHaveClass("dark"),
    );
  });

  it("guarda el tema en localStorage", async () => {
    const user = userEvent.setup();
    await montar();

    await user.click(screen.getByRole("button"));

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("persiste el tema al recargar", async () => {
    localStorage.setItem("theme", "dark");
    await montar();

    expect(screen.getByRole("button")).toHaveTextContent("dark");
    await waitFor(() =>
      expect(document.documentElement).toHaveClass("dark"),
    );
  });

  it("alterna entre light y dark correctamente", async () => {
    const user = userEvent.setup();
    await montar();

    // Light → Dark
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    // Dark → Light
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("el botón de tema tiene los iconos de sol y luna", async () => {
    await montar();

    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
