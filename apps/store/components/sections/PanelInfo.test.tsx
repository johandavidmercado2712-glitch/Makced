import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PanelInfo from "./PanelInfo";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const propsBase = {
  titulo: "Envíos gratis",
  descripcion: "En compras superiores a $200.000",
  image: "/banner.jpg",
  button: "Comprar ahora",
};

describe("PanelInfo", () => {
  it("renderiza título y descripción", () => {
    render(<PanelInfo {...propsBase} link="/ofertas" />);

    expect(screen.getByText("Envíos gratis")).toBeInTheDocument();
    expect(
      screen.getByText("En compras superiores a $200.000"),
    ).toBeInTheDocument();
  });

  it("renderiza CTA con next/link cuando el link es interno", () => {
    render(<PanelInfo {...propsBase} link="/ofertas" />);

    const cta = screen.getByRole("link", { name: "Comprar ahora" });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/ofertas");
    expect(cta).toHaveClass("panel-info-cta");
  });

  it("renderiza CTA con <a> cuando el link es externo", () => {
    render(<PanelInfo {...propsBase} link="https://instagram.com/makced" />);

    const cta = screen.getByRole("link", { name: "Comprar ahora" });
    expect(cta).toHaveAttribute("href", "https://instagram.com/makced");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("no renderiza CTA cuando el link es '#'", () => {
    render(<PanelInfo {...propsBase} link="#" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("no renderiza CTA cuando el link está vacío", () => {
    render(<PanelInfo {...propsBase} link="  " />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("tiene aria-label con el título", () => {
    const { container } = render(<PanelInfo {...propsBase} link="/ofertas" />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-label", "Envíos gratis");
  });

  it("aplica la imagen de fondo como variable CSS", () => {
    const { container } = render(<PanelInfo {...propsBase} link="/ofertas" />);

    const section = container.querySelector("section") as HTMLElement;
    expect(section.style.getPropertyValue("--panel-bg")).toBe(
      "url(/banner.jpg)",
    );
  });

  it("renderiza link externo sin http(s) como <a> sin target blank", () => {
    render(<PanelInfo {...propsBase} link="mailto:info@makced.com" />);

    const cta = screen.getByRole("link", { name: "Comprar ahora" });
    expect(cta).toHaveAttribute("href", "mailto:info@makced.com");
    expect(cta).not.toHaveAttribute("target");
  });
});
