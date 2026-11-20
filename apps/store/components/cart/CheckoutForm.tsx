"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { DatosCliente, ErroresValidacion } from "../../lib/validacion"
import {
  validarNombre,
  validarTelefono,
  validarDireccion,
  validarNotas,
  tieneErrores,
} from "../../lib/validacion"
import CheckoutCampo from "./CheckoutCampo"
import "./CheckoutForm.css"

interface CheckoutFormProps {
  onValidChange: (datos: DatosCliente, isValid: boolean) => void;
  initialData?: Partial<DatosCliente>;
}

export default function CheckoutForm({ onValidChange, initialData }: CheckoutFormProps) {
  const [datos, setDatos] = useState<DatosCliente>({
    nombre: initialData?.nombre ?? "",
    telefono: initialData?.telefono ?? "",
    direccion: initialData?.direccion ?? "",
    notas: initialData?.notas ?? "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const calcularErrores = useCallback((d: DatosCliente): ErroresValidacion => ({
    nombre: validarNombre(d.nombre),
    telefono: validarTelefono(d.telefono),
    direccion: validarDireccion(d.direccion),
    notas: validarNotas(d.notas ?? ""),
  }), []);

  const nuevosErrores = useMemo<ErroresValidacion>(
    () => calcularErrores(datos),
    [datos, calcularErrores],
  );

  const handleChange = useCallback(
    (campo: keyof DatosCliente, valor: string) => {
      const nuevos = { ...datos, [campo]: valor };
      const errores = calcularErrores(nuevos);
      setDatos(nuevos);
      onValidChange(nuevos, !tieneErrores(errores));
    },
    [datos, calcularErrores, onValidChange],
  );

  const handleBlur = useCallback(
    (campo: keyof DatosCliente) => {
      setTouched((prev) => ({ ...prev, [campo]: true }));
    },
    [],
  );

  // Guardar en localStorage cuando los datos son válidos (side effect legítimo)
  useEffect(() => {
    if (!tieneErrores(nuevosErrores)) {
      localStorage.setItem("checkout-datos", JSON.stringify(datos));
    }
  }, [datos, nuevosErrores]);

  return (
    <div className="checkout-form">
      <h3 className="checkout-form-title">Datos de entrega</h3>
      <p className="checkout-form-subtitle">
        Completa tus datos para que podamos enviar tu pedido por WhatsApp.
      </p>

      <CheckoutCampo
        id="checkout-nombre"
        label="Nombre completo"
        required
        placeholder="Ej: María García"
        autoComplete="name"
        valor={datos.nombre}
        error={nuevosErrores.nombre}
        touched={Boolean(touched.nombre)}
        onChange={(v) => handleChange("nombre", v)}
        onBlur={() => handleBlur("nombre")}
      />

      <CheckoutCampo
        id="checkout-telefono"
        label="Teléfono"
        required
        type="tel"
        placeholder="Ej: 300 123 4567"
        autoComplete="tel"
        valor={datos.telefono}
        error={nuevosErrores.telefono}
        touched={Boolean(touched.telefono)}
        onChange={(v) => handleChange("telefono", v)}
        onBlur={() => handleBlur("telefono")}
      />

      <CheckoutCampo
        id="checkout-direccion"
        label="Dirección de entrega"
        required
        placeholder="Ej: Calle 123 #45-67, Barrio Centro, Apto 301"
        autoComplete="street-address"
        isTextarea
        rows={2}
        valor={datos.direccion}
        error={nuevosErrores.direccion}
        touched={Boolean(touched.direccion)}
        onChange={(v) => handleChange("direccion", v)}
        onBlur={() => handleBlur("direccion")}
      />

      <CheckoutCampo
        id="checkout-notas"
        label="Notas adicionales (opcional)"
        placeholder="Ej: Dejar en portería, horario de entrega preferido..."
        isTextarea
        rows={2}
        valor={datos.notas ?? ""}
        error={nuevosErrores.notas}
        touched={Boolean(touched.notas)}
        onChange={(v) => handleChange("notas", v)}
        onBlur={() => handleBlur("notas")}
      />
    </div>
  );
}
