"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Tag, Box, ChevronDown, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Tag,
  Box,
};

interface Option {
  id: string;
  nombre: string;
}

interface FilterSelectProps {
  icon: string;
  label: string;
  options: Option[];
  paramKey: string;
  defaultValue?: string;
}

export default function FilterSelect({
  icon,
  label,
  options,
  paramKey,
  defaultValue,
}: FilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const Icon = iconMap[icon];

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(paramKey, value);
    } else {
      params.delete(paramKey);
    }
    startTransition(() => {
      router.replace(`/productos?${params.toString()}`);
    });
  }

  return (
    <div className="db-filter-select">
      {Icon && <Icon size={16} className="db-filter-select-icon" />}
      <select
        className="db-filter-select-native"
        defaultValue={defaultValue || ""}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">Todas las {label}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.nombre}
          </option>
        ))}
      </select>
      {isPending && <span style={{ fontSize: 12, color: "var(--db-text-muted)" }}>...</span>}
      <ChevronDown size={16} className="db-filter-select-arrow" />
    </div>
  );
}
