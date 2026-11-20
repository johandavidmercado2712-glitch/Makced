import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
  cta?: ReactNode;
  paso?: { numero: number; total: number; texto: string };
}

export function EmptyState({
  icon: Icon,
  titulo,
  descripcion,
  cta,
  paso,
}: EmptyStateProps) {
  return (
    <div className="db-empty">
      <div className="db-empty-icon-wrap db-empty-icon-animated">
        <Icon size={28} className="db-empty-icon-svg" />
      </div>
      {paso && (
        <span className="db-empty-paso">
          Paso {paso.numero} de {paso.total}
        </span>
      )}
      <p className="db-empty-titulo">{titulo}</p>
      <p className="db-empty-texto">{descripcion}</p>
      {cta && <div className="db-empty-action">{cta}</div>}
    </div>
  );
}
