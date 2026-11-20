"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { ModalProduct } from "@/components/modal/modalProduct";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { ModalSaveHandler } from "@/types/components";
import type { RefSimple } from "@/types/database";

interface ProductosActionsProps {
  marcas: RefSimple[];
  categorias: RefSimple[];
  onSave: ModalSaveHandler;
}

export function ProductosActions({
  marcas,
  categorias,
  onSave,
}: ProductosActionsProps) {
  const router = useRouter();

  const abrirNuevo = useCallback(() => {
    document.getElementById("btn-nuevo-producto")?.click();
  }, []);

  const shortcuts = useMemo(
    () => [{ key: "n", handler: abrirNuevo, description: "Nuevo producto" }],
    [abrirNuevo],
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="db-header-actions">
      <button
        type="button"
        className="db-icon-btn"
        onClick={() => router.refresh()}
        aria-label="Refrescar lista"
      >
        <RefreshCw size={18} />
      </button>
      <ModalProduct
        marcas={marcas}
        categorias={categorias}
        onSave={onSave}
        triggerId="btn-nuevo-producto"
        trigger={
          <>
            <Plus size={18} /> Nuevo producto
          </>
        }
      />
    </div>
  );
}

export default ProductosActions;
