"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { rutaTienda } from "../../lib/rutas";

interface TenantValor {
  tiendaId: string | null;
  subdominio: string | null;
}

const TenantContext = createContext<TenantValor>({
  tiendaId: null,
  subdominio: null,
});

export function TenantProvider({
  tiendaId,
  subdominio,
  children,
}: TenantValor & { children: ReactNode }) {
  const value = useMemo(() => ({ tiendaId, subdominio }), [tiendaId, subdominio]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantValor {
  return useContext(TenantContext);
}

export function useRutaTienda(): (path: string) => string {
  const { subdominio } = useTenant();
  return useMemo(() => (path: string) => rutaTienda(subdominio, path), [subdominio]);
}