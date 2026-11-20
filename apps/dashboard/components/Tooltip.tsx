"use client";

import { useState, useId, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  contenido: string;
  children?: ReactNode;
}

export function Tooltip({ contenido, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span className="db-tooltip-wrap">
      {children ?? (
        <button
          type="button"
          className="db-tooltip-trigger"
          aria-label="Ayuda"
          aria-describedby={visible ? tooltipId : undefined}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          onFocus={() => setVisible(true)}
          onBlur={() => setVisible(false)}
        >
          <HelpCircle size={14} />
        </button>
      )}
      {visible && (
        <span id={tooltipId} role="tooltip" className="db-tooltip-bubble">
          {contenido}
        </span>
      )}
    </span>
  );
}
