"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type ToastVariant = "default" | "celebration" | "success" | "undo";

export interface CartToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
  countdown: number;
  action?: () => Promise<void>;
}

export function useCartToast(duration = 4000) {
  const [state, setState] = useState<CartToastState>({
    visible: false,
    message: "",
    variant: "default",
    countdown: Math.ceil(duration / 1000),
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({
      visible: false,
      message: "",
      variant: "default",
      countdown: Math.ceil(duration / 1000),
    });
  }, [duration]);

  const show = useCallback(
    (message: string, variant: ToastVariant = "default", action?: () => Promise<void>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      const seconds = Math.ceil(duration / 1000);
      setState({ visible: true, message, variant, countdown: seconds, action });

      // Countdown for undo
      if (variant === "undo") {
        intervalRef.current = setInterval(() => {
          setState((prev) => {
            if (prev.countdown <= 1) return prev;
            return { ...prev, countdown: prev.countdown - 1 };
          });
        }, 1000);
      }

      timeoutRef.current = setTimeout(() => {
        hide();
      }, duration);
    },
    [duration, hide],
  );

  const undo = useCallback(async () => {
    if (state.action) {
      await state.action();
    }
    hide();
  }, [state.action, hide]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { state, show, hide, undo };
}
