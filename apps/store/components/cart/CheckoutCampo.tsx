import type { DatosCliente, ErroresValidacion } from "../../lib/validacion";

interface CheckoutCampoProps {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  isTextarea?: boolean;
  rows?: number;
  valor: string;
  error?: string;
  touched: boolean;
  onChange: (valor: string) => void;
  onBlur: () => void;
}

export default function CheckoutCampo({
  id,
  label,
  required = false,
  type = "text",
  placeholder,
  autoComplete,
  isTextarea = false,
  rows = 2,
  valor,
  error,
  touched,
  onChange,
  onBlur,
}: CheckoutCampoProps) {
  const hasError = Boolean(error && touched);
  const inputClass = `checkout-input ${isTextarea ? "checkout-textarea" : ""} ${hasError ? "checkout-input--error" : ""}`;

  return (
    <div className="checkout-field">
      <label className="checkout-label" htmlFor={id}>
        {label} {required && <span className="checkout-required">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={id}
          className={inputClass}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={rows}
          required={required}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={inputClass}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
      )}
      {hasError && (
        <span className="checkout-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
