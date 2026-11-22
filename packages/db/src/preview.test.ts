import { describe, expect, it } from "vitest";
import { firmarPreview, verificarPreview } from "./preview";

const SECRET = "secreto-solo-para-pruebas";
const AHORA = 1_700_000_000_000; // fijo para que la expiración sea determinista

const contenido = {
  sub: "makced",
  tiendaId: "tienda-1",
  colorPrincipal: "#10b981",
  logoUrl: "/logo.png",
  config: {
    titulos: { categorias: "CATEGORIAS", productos: "PRODUCTOS NUEVOS" },
    banner: { slides: [{ palabra: "Hola", parrafo: "Mundo" }] },
  },
};

const firmar = (overrides: Partial<typeof contenido> = {}) =>
  firmarPreview(
    { ...contenido, ...overrides },
    { secret: SECRET, ttlSegundos: 900, ahora: AHORA },
  ).token;

describe("preview token", () => {
  it("hace round-trip del contenido", () => {
    const { token, exp } = firmarPreview(contenido, {
      secret: SECRET,
      ttlSegundos: 900,
      ahora: AHORA,
    });

    const payload = verificarPreview(token, {
      secret: SECRET,
      subdominio: "makced",
      ahora: AHORA + 1000,
    });

    expect(exp).toBe(Math.floor(AHORA / 1000) + 900);
    expect(payload).not.toBeNull();
    expect(payload?.tid).toBe("tienda-1");
    expect(payload?.color).toBe("#10b981");
    expect(payload?.logo).toBe("/logo.png");
    expect(payload?.cfg).toEqual(contenido.config);
  });

  it("rechaza un subdominio distinto", () => {
    const token = firmar();

    expect(
      verificarPreview(token, {
        secret: SECRET,
        subdominio: "otra-tienda",
        ahora: AHORA,
      }),
    ).toBeNull();
  });

  it("rechaza un token expirado", () => {
    const token = firmar();

    expect(
      verificarPreview(token, {
        secret: SECRET,
        subdominio: "makced",
        ahora: AHORA + 901_000,
      }),
    ).toBeNull();
  });

  it("rechaza un token manipulado", () => {
    const token = firmar();
    const [cuerpo, firma] = token.split(".");
    const alterado = `${cuerpo.slice(0, -2)}AA.${firma}`;

    expect(
      verificarPreview(alterado, {
        secret: SECRET,
        subdominio: "makced",
        ahora: AHORA,
      }),
    ).toBeNull();
  });

  it("rechaza un secreto distinto", () => {
    const token = firmar();

    expect(
      verificarPreview(token, {
        secret: "otro-secreto",
        subdominio: "makced",
        ahora: AHORA,
      }),
    ).toBeNull();
  });

  it("rechaza tokens malformados sin lanzar", () => {
    for (const token of ["", "sin-punto", "a.b", ".firma", "cuerpo.", "x".repeat(25_000)]) {
      expect(
        verificarPreview(token, {
          secret: SECRET,
          subdominio: "makced",
          ahora: AHORA,
        }),
      ).toBeNull();
    }
  });

  it("comprime el config para que quepa en la URL", () => {
    const token = firmar();

    expect(token.length).toBeLessThan(2_000);
  });
});
