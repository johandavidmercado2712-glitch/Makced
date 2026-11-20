"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface UndoToastState {
  visible: boolean;
  message: string;
  undoAction: (() => Promise<void>) | null;
  countdown: number;
  variant?: 'default' | 'celebration';
}

export function useUndoToast(duration = 5000) {
  const [state, setState] = useState<UndoToastState>({
    visible: false,
    message: "",
    undoAction: null,
    countdown: Math.ceil(duration / 1000),
    variant: 'default',
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
      undoAction: null,
      countdown: Math.ceil(duration / 1000),
      variant: 'default',
    });
  }, [duration]);

  const show = useCallback(
    (message: string, undoAction: () => Promise<void>, variant: 'default' | 'celebration' = 'default') => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const seconds = Math.ceil(duration / 1000);
      setState({ visible: true, message, undoAction, countdown: seconds, variant });

      // Countdown interval
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.countdown <= 1) {
            return prev;
          }
          return { ...prev, countdown: prev.countdown - 1 };
        });
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        hide();
      }, duration);
    },
    [duration, hide],
  );

  const undo = useCallback(async () => {
    if (state.undoAction) {
      await state.undoAction();
    }
    hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.undoAction, hide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { state, show, hide, undo };
}
