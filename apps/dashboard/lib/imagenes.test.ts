import { describe, expect, it } from "vitest";
import {
  MAX_IMAGEN_MB,
  resolverImagen,
  texto,
  urlImagen,
  validarImagen,
} from "@/lib/imagenes";

describe("urlImagen", () => {
  it("resuelve rutas relativas contra la URL de la tienda", () => {
    expect(urlImagen("/hombre.jpg")).toBe("http://localhost:3000/hombre.jpg");
    expect(urlImagen("/categorias/mujer.png")).toBe(
      "http://localhost:3000/categorias/mujer.png",
    );
  });

  it("deja intactas las URLs absolutas", () => {
    expect(urlImagen("https://worldvectorlogo.com/logos/nike.svg")).toBe(
      "https://worldvectorlogo.com/logos/nike.svg",
    );
    expect(urlImagen("blob:http://localhost/abc")).toBe("blob:http://localhost/abc");
  });
});

describe("texto", () => {
  it("normaliza vacíos a null y trimea valores", () => {
    expect(texto(new FormData(), "falta")).toBeNull();
    expect(texto(formCon("campo", "  hola  "), "campo")).toBe("hola");
    expect(texto(formCon("campo", "   "), "campo")).toBeNull();
    expect(texto(formCon("campo", "0"), "campo")).toBe("0");
  });
});

describe("resolverImagen", () => {
  const actual = (sobrescribir: Record<string, string> = {}) => {
    const fd = new FormData();
    fd.set("ck-imagen-actual-url", "/hombre.jpg");
    fd.set("ck-imagen-actual-key", "categorias/viejo.jpg");
    for (const [k, v] of Object.entries(sobrescribir)) fd.set(k, v);
    return fd;
  };

  it("al quitar: anula url y key y recuerda la key anterior", () => {
    const r = resolverImagen(actual({ "ck-imagen-quitar": "true" }), "ck");
    expect(r).toEqual({
      imagen_url: null,
      imagen_key: null,
      claveAnterior: "categorias/viejo.jpg",
    });
  });

  it("sin cambios de URL: conserva url y key actuales", () => {
    const fd = actual();
    fd.set("ck-imagen", "/hombre.jpg");
    const r = resolverImagen(fd, "ck");
    expect(r.imagen_url).toBe("/hombre.jpg");
    expect(r.imagen_key).toBe("categorias/viejo.jpg");
    expect(r.claveAnterior).toBe("categorias/viejo.jpg");
  });

  it("URL nueva: usa la nueva url, la key del upload y recuerda la anterior", () => {
    const fd = actual();
    fd.set("ck-imagen", "https://cdn.test/nuevo.jpg");
    fd.set("ck-imagen-key", "categorias/nuevo.jpg");
    const r = resolverImagen(fd, "ck");
    expect(r).toEqual({
      imagen_url: "https://cdn.test/nuevo.jpg",
      imagen_key: "categorias/nuevo.jpg",
      claveAnterior: "categorias/viejo.jpg",
    });
  });
});

describe("validarImagen", () => {
  it("acepta JPG/PNG/WebP dentro del límite", () => {
    const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    expect(validarImagen(file)).toBeNull();
  });

  it("rechaza tipos no permitidos", () => {
    const file = new File(["x"], "anim.gif", { type: "image/gif" });
    expect(validarImagen(file)).toMatch(/Formato no válido/);
  });

  it(`rechaza archivos mayores a ${MAX_IMAGEN_MB} MB`, () => {
    const file = new File(["x"], "grande.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", {
      value: (MAX_IMAGEN_MB + 1) * 1024 * 1024,
    });
    expect(validarImagen(file)).toMatch(/supera/);
  });
});

function formCon(campo: string, valor: string): FormData {
  const fd = new FormData();
  fd.set(campo, valor);
  return fd;
}
