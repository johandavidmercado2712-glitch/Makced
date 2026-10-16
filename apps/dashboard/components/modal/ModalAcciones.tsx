"use client";

import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface ModalAccionesProps {
  /** Nodo del botón de apertura cuando el modal se usa como "nuevo X" (sin acciones de fila) */
  trigger?: ReactNode;
  onAbrir: () => void;
  onEliminar: () => void;
  /** onDeleteProvided && entidad con id */
  puedeEliminar: boolean;
  ocupado: boolean;
  editarLabel: string;
  eliminarLabel: string;
}

/** Bloque de acciones de fila (editar/eliminar) o trigger de "nuevo", compartido por los modales CRUD. */
export function ModalAcciones({
  trigger,
  onAbrir,
  onEliminar,
  puedeEliminar,
  ocupado,
  editarLabel,
  eliminarLabel,
}: ModalAccionesProps) {
  if (trigger) {
    return (
      <button type="button" className="db-btn-primary db-modal-trigger" onClick={onAbrir}>
        {trigger}
      </button>
    );
  }

  return (
    <div className="db-actions">
      <button
        type="button"
        className="db-action-btn"
        onClick={onAbrir}
        aria-label={editarLabel}
      >
        <Pencil size={16} />
      </button>

      {puedeEliminar && (
        <button
          type="button"
          className="db-action-btn db-action-delete"
          onClick={onEliminar}
          disabled={ocupado}
          aria-label={eliminarLabel}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
