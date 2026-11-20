// Validación de datos del cliente para checkout
// Formato colombiano

export interface DatosCliente {
  nombre: string;
  telefono: string;
  direccion: string;
  notas?: string;
}

export interface ErroresValidacion {
  nombre?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
}

const TELEFONO_REGEX = /^(\+57\s?)?3\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;
const NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;

export function validarNombre(nombre: string): string | undefined {
  const limpio = nombre.trim();
  if (!limpio) return "El nombre es obligatorio";
  if (limpio.length < 3) return "El nombre debe tener al menos 3 caracteres";
  if (limpio.length > 50) return "El nombre no puede superar 50 caracteres";
  if (!NOMBRE_REGEX.test(limpio)) return "El nombre solo puede contener letras y espacios";
  return undefined;
}

export function validarTelefono(telefono: string): string | undefined {
  const limpio = telefono.trim().replace(/\s/g, "");
  if (!limpio) return "El teléfono es obligatorio";
  if (!TELEFONO_REGEX.test(limpio)) {
    return "Ingresa un número válido (ej: 300 123 4567 o +57 300 123 4567)";
  }
  return undefined;
}

export function validarDireccion(direccion: string): string | undefined {
  const limpio = direccion.trim();
  if (!limpio) return "La dirección es obligatoria";
  if (limpio.length < 10) return "La dirección debe tener al menos 10 caracteres";
  if (limpio.length > 200) return "La dirección no puede superar 200 caracteres";
  return undefined;
}

export function validarNotas(notas: string): string | undefined {
  const limpio = notas.trim();
  if (limpio.length > 500) return "Las notas no pueden superar 500 caracteres";
  return undefined;
}

export function validarDatosCliente(datos: DatosCliente): ErroresValidacion {
  return {
    nombre: validarNombre(datos.nombre),
    telefono: validarTelefono(datos.telefono),
    direccion: validarDireccion(datos.direccion),
    notas: validarNotas(datos.notas ?? ""),
  };
}

export function tieneErrores(errores: ErroresValidacion): boolean {
  return Object.values(errores).some((e) => e !== undefined);
}

export function formatearTelefono(telefono: string): string {
  const limpio = telefono.trim().replace(/\s/g, "");
  if (limpio.startsWith("+57")) {
    const numero = limpio.slice(3);
    return `+57 ${numero.slice(0, 3)} ${numero.slice(3, 6)} ${numero.slice(6)}`;
  }
  return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`;
}
