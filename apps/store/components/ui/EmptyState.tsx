import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateCTA {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
  cta?: EmptyStateCTA;
  ctaSecondary?: EmptyStateCTA[];
}

export function EmptyState({ icon: Icon, titulo, descripcion, cta, ctaSecondary }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-titulo">{titulo}</h3>
      <p className="empty-state-descripcion">{descripcion}</p>
      {cta && (
        <div className="empty-state-cta">
          <Link href={cta.href}>{cta.label}</Link>
        </div>
      )}
      {ctaSecondary && ctaSecondary.length > 0 && (
        <div className="empty-state-cta-secondary">
          {ctaSecondary.map((cta) => (
            <Link key={cta.href} href={cta.href} className="empty-state-cta-link">
              {cta.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
