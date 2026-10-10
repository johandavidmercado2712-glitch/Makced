"use client";

import { useRouter } from "next/navigation";
import { Box, RefreshCw, Tag } from "lucide-react";
import { ModalMarca } from "@/components/modal/modalMarca";
import { ModalCategoria } from "@/components/modal/modalCategoria";
import type {
  CategoriaModalData,
  EntidadSaveHandler,
  MarcaModalData,
} from "@/types/components";

interface MarcasActionsProps {
  onGuardarMarca: EntidadSaveHandler<MarcaModalData>;
  onGuardarCategoria: EntidadSaveHandler<CategoriaModalData>;
}

export function MarcasActions({
  onGuardarMarca,
  onGuardarCategoria,
}: MarcasActionsProps) {
  const router = useRouter();

  return (
    <div className="db-header-actions">
      <button
        type="button"
        className="db-icon-btn"
        onClick={() => router.refresh()}
        aria-label="Refrescar listas"
      >
        <RefreshCw size={18} />
      </button>
      <ModalMarca
        onSave={onGuardarMarca}
        trigger={
          <>
            <Tag size={18} /> Nueva marca
          </>
        }
      />
      <ModalCategoria
        onSave={onGuardarCategoria}
        trigger={
          <>
            <Box size={18} /> Nueva categoría
          </>
        }
      />
    </div>
  );
}

export default MarcasActions;
