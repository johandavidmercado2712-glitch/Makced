"use client";

import { Undo2, X, PartyPopper } from "lucide-react";
import type { UndoToastState } from "@/hooks/useUndoToast";

interface ToastProps {
  state: UndoToastState;
  onUndo: () => void;
  onDismiss: () => void;
  variant?: 'default' | 'celebration';
}

export function Toast({ state, onUndo, onDismiss, variant = 'default' }: ToastProps) {
  if (!state.visible) return null;

  const isCelebration = variant === 'celebration';

  return (
    <div className={`db-toast ${isCelebration ? 'db-toast-celebration' : ''}`} role="status" aria-live="polite">
      <div className="db-toast-content">
        {isCelebration && (
          <div className="db-toast-celebration-icon">
            <PartyPopper size={20} />
          </div>
        )}
        <span className="db-toast-message">{state.message}</span>
        <div className="db-toast-actions">
          {state.undoAction && (
            <button
              type="button"
              className={`db-toast-btn db-toast-btn-undo ${state.countdown <= 2 ? 'db-toast-btn-pulse' : ''}`}
              onClick={onUndo}
            >
              <Undo2 size={14} />
              Deshacer ({state.countdown})
            </button>
          )}
          <button
            type="button"
            className="db-toast-btn db-toast-btn-dismiss"
            onClick={onDismiss}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="db-toast-progress" />
    </div>
  );
}
