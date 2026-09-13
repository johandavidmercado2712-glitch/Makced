"use client";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useScrollReveal();

  return (
    <div 
      ref={ref} 
      className={`scroll-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
