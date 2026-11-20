"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import { X, Loader2 } from "lucide-react";
import "./modalProduct.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  body: ReactNode;
  errorGuardado: string | null;
  ocupado: boolean;
  submitLabel: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  idValue: string;
}

/**
 * Shell del modal (dialog > form > div) que se repite en tres lugares.
 * Solo se definen: título, subtítulo, body, footer estándar y el botón cierre.
 * Los modales concretos (categoría/producto/marca) se quedan con su body.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  body,
  errorGuardado,
  ocupado,
  submitLabel,
  onSubmit,
  idValue,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const form = dialogRef.current?.querySelector("form");
        if (form && !ocupado) {
          form.requestSubmit();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, ocupado]);

  return (
    <dialog
      ref={dialogRef}
      className="db-modal"
      onClose={onClose}
      aria-labelledby={titleId}
    >
      {isOpen && (
        <form className="db-modal-box" onSubmit={onSubmit}>
          <input type="hidden" name="id" value={idValue} />

          <div className="db-modal-header">
            <div>
              <h2 id={titleId} className="db-modal-title">{title}</h2>
              <p className="db-modal-subtitle">{subtitle}</p>
            </div>
            <button
              type="button"
              className="db-modal-close"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="db-modal-body">
            {body}
          </div>

          {submitLabel && (
            <div className="db-modal-footer">
              {errorGuardado && (
                <p className="db-modal-error" role="alert">
                  {errorGuardado}
                </p>
              )}
              <button
                type="button"
                className="db-modal-btn db-modal-btn-secondary"
                onClick={onClose}
                disabled={ocupado}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="db-modal-btn db-modal-btn-primary"
                disabled={ocupado}
              >
                {ocupado && <Loader2 size={16} className="db-spinner" />}
                {submitLabel}
              </button>
            </div>
          )}
        </form>
      )}
    </dialog>
  );
}
