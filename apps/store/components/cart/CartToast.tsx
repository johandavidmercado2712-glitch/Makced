"use client";

import { Undo2, X, PartyPopper, Check } from "lucide-react";
import { useEffect, useState } from "react";

type ToastVariant = "default" | "celebration" | "success" | "undo";

interface CartToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  countdown?: number;
  onUndo?: () => void;
  onDismiss: () => void;
}

export function CartToast({
  visible,
  message,
  variant = "default",
  countdown = 0,
  onUndo,
  onDismiss,
}: CartToastProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!visible || variant !== "celebration") return;
    const timer = setTimeout(() => setShowConfetti(true), 0);
    const timer2 = setTimeout(() => setShowConfetti(false), 1000);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [visible, variant]);

  if (!visible) return null;

  const isCelebration = variant === "celebration";
  const isSuccess = variant === "success";
  const isUndo = variant === "undo";

  return (
    <div
      className={`cart-toast ${isCelebration ? "cart-toast--celebration" : ""} ${isSuccess ? "cart-toast--success" : ""}`}
      role="status"
      aria-live="polite"
    >
      {/* Confetti sutil para celebración */}
      {isCelebration && showConfetti && (
        <div className="cart-toast-confetti" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="cart-toast-confetti-particle"
              style={{
                "--confetti-delay": `${i * 0.1}s`,
                "--confetti-x": `${(i * 37 + 13) % 80 - 40}px`,
                "--confetti-y": `${-(i * 53 + 29) % 60 - 30}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <div className="cart-toast-content">
        {isCelebration && (
          <div className="cart-toast-icon cart-toast-icon--celebration">
            <PartyPopper size={20} />
          </div>
        )}
        {isSuccess && (
          <div className="cart-toast-icon cart-toast-icon--success">
            <Check size={20} />
          </div>
        )}
        <span className="cart-toast-message">{message}</span>
        <div className="cart-toast-actions">
          {isUndo && onUndo && (
            <button
              type="button"
              className={`cart-toast-btn cart-toast-btn--undo ${countdown <= 2 ? "cart-toast-btn--pulse" : ""}`}
              onClick={onUndo}
            >
              <Undo2 size={14} />
              Deshacer ({countdown})
            </button>
          )}
          <button
            type="button"
            className="cart-toast-btn cart-toast-btn--dismiss"
            onClick={onDismiss}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="cart-toast-progress" />
    </div>
  );
}
