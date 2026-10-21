'use client';

import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
  maxLength: number;
  minLength?: number;
  invalid?: boolean;
}

export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  show,
  onToggle,
  maxLength,
  minLength,
  invalid = false,
}: PasswordFieldProps) {
  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrapper">
        <LockKeyhole className="input-icon" size={18} aria-hidden="true" />
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="••••••••••••"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`form-input has-toggle${invalid ? ' input-invalid' : ''}`}
          maxLength={maxLength}
          minLength={minLength}
          aria-invalid={invalid || undefined}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={onToggle}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={show}
          aria-controls={id}
        >
          {show ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
