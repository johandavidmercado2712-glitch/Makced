"use client";

import { useCallback, useEffect, useRef } from "react";
import { ProductTable } from "@/components/ProductTable";
import { Toast } from "@/components/Toast";
import { useUndoToast } from "@/hooks/useUndoToast";
import { restaurarProducto } from "@/actions/products";
import type { ProductoLista, RefSimple } from "@/types/database";
import type { ModalSaveHandler, GuardadoResultado } from "@/types/components";

interface ProductTableWithUndoProps {
  productos: ProductoLista[];
  marcas: RefSimple[];
  categorias: RefSimple[];
  onSave: ModalSaveHandler;
  onDelete: (id: string) => Promise<GuardadoResultado>;
  esPrimerProducto?: boolean;
}

export function ProductTableWithUndo({
  productos,
  marcas,
  categorias,
  onSave,
  onDelete,
  esPrimerProducto = false,
}: ProductTableWithUndoProps) {
  const { state: toastState, show: showToast, hide: hideToast, undo } = useUndoToast();
  const haMostradoCelebracion = useRef(false);

  // Mostrar toast de celebración cuando es el primer producto
  useEffect(() => {
    if (esPrimerProducto && !haMostradoCelebracion.current) {
      haMostradoCelebracion.current = true;
      showToast(
        "¡Tu primer producto está en la tienda!",
        async () => {
          // No hay acción de undo para celebración
        },
        'celebration'
      );
    }
  }, [esPrimerProducto, showToast]);

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await onDelete(id);
      if (result.ok) {
        showToast("Producto eliminado", async () => {
          await restaurarProducto(id);
        });
      }
      return result;
    },
    [onDelete, showToast],
  );

  return (
    <>
      <ProductTable
        productos={productos}
        marcas={marcas}
        categorias={categorias}
        onSave={onSave}
        onDelete={handleDelete}
      />
      <Toast state={toastState} onUndo={undo} onDismiss={hideToast} variant={toastState.variant} />
    </>
  );
}
