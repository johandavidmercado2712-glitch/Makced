"use client";

import { Trash2 } from "lucide-react";
import { Modal } from "./Modal";

export interface ConfirmModalProps {
  titulo: string;
  mensaje: string;
  onConfirm: () => void;
  onCancel?: () => void;
  mostrar?: boolean;
}

export function ConfirmModal({ titulo, mensaje, onConfirm, onCancel, mostrar = false }: ConfirmModalProps) {
  const abierto = mostrar;

  const manejarConfirmar = () => {
    onConfirm();
  };

  const manejarCancelar = () => {
    onCancel?.();
  };

  if (!mostrar) return null;

  return (
    <Modal
      isOpen={abierto}
      onClose={manejarCancelar}
      title={titulo}
      subtitle=""
      errorGuardado={null}
      ocupado={false}
      submitLabel=""
      onSubmit={() => {}}
      idValue=""
      body={
        <div className="db-confirmation">
          <div className="db-confirmation-icon">
            <Trash2 size={24} />
          </div>
          <p className="db-confirmation-text">{mensaje}</p>
          <div className="db-confirmation-actions">
            <button
              type="button"
              className="db-modal-btn db-modal-btn-secondary"
              onClick={manejarCancelar}
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="db-modal-btn db-modal-btn-danger"
              onClick={manejarConfirmar}
              aria-label="Confirmar eliminación"
            >
              Eliminar
            </button>
          </div>
        </div>
      }
    />
  );
}
