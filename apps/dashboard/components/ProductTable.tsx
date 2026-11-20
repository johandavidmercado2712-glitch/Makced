"use client";

// Ver comentario en MarcasWithUndo.tsx: URLs de Storage + previews `blob:`.
/* eslint-disable @next/next/no-img-element */

import { useState, useTransition, useCallback, useMemo } from "react";
import { Star, Package } from "lucide-react";
import { urlImagen } from "@/lib/imagenes";
import { ModalProduct } from "@/components/modal/modalProduct";
import { EmptyState } from "@/components/EmptyState";
import { actualizarEstadoProductos } from "@/actions/products";
import type { ProductoLista, RefSimple } from "@/types/database";
import type { ModalSaveHandler, GuardadoResultado } from "@/types/components";
import "./ProductTable.css";

type DeleteHandler = (id: string) => Promise<GuardadoResultado>;

interface ProductTableProps {
  productos: ProductoLista[];
  marcas: RefSimple[];
  categorias: RefSimple[];
  onSave: ModalSaveHandler;
  onDelete: DeleteHandler;
}

export function ProductTable({
  productos,
  marcas,
  categorias,
  onSave,
  onDelete,
}: ProductTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const allSelected =
    productos.length > 0 && selected.size === productos.length;

  // Generar valores aleatorios para confetti de forma pura
  const confettiValues = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      delay: i * 0.1,
      x: ((i * 37 + 13) % 100) - 50, // Pseudo-random basado en índice
      y: -((i * 53 + 29) % 100) - 50,
    }));
  }, []);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(productos.map((p) => p.id)));
    }
  }, [allSelected, productos]);

  const handleBulkUpdate = useCallback(
    (estado: boolean) => {
      if (selected.size === 0) return;
      
      // Mostrar confetti si son 10+ productos
      if (selected.size >= 10) {
        setShowConfetti(true);
        setConfettiKey(prev => prev + 1);
        setTimeout(() => setShowConfetti(false), 1000);
      }
      
      startTransition(async () => {
        const result = await actualizarEstadoProductos(
          Array.from(selected),
          estado,
        );
        if (result.ok) {
          setBulkMsg(
            `${selected.size} producto${selected.size > 1 ? "s" : ""} ${estado ? "activado" : "desactivado"}${selected.size > 1 ? "s" : ""}`,
          );
          setSelected(new Set());
          setTimeout(() => setBulkMsg(null), 3000);
        } else {
          setBulkMsg(result.error ?? "Error al actualizar");
          setTimeout(() => setBulkMsg(null), 5000);
        }
      });
    },
    [selected],
  );

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  return (
    <>
      {selected.size > 0 && (
        <div className="db-bulk-bar">
          <span className="db-bulk-count db-bulk-count-animated" key={selected.size}>
            {selected.size} seleccionado{selected.size > 1 ? "s" : ""}
          </span>
          <div className="db-bulk-actions">
            <button
              type="button"
              className="db-bulk-btn db-bulk-btn-activate"
              onClick={() => handleBulkUpdate(true)}
              disabled={isPending}
            >
              Activar
            </button>
            <button
              type="button"
              className="db-bulk-btn db-bulk-btn-deactivate"
              onClick={() => handleBulkUpdate(false)}
              disabled={isPending}
            >
              Desactivar
            </button>
            <button
              type="button"
              className="db-bulk-btn db-bulk-btn-clear"
              onClick={clearSelection}
              disabled={isPending}
            >
              Deseleccionar
            </button>
          </div>
          {bulkMsg && <span className="db-bulk-msg">{bulkMsg}</span>}
        </div>
      )}

      {/* Confetti sutil */}
      {showConfetti && (
        <div className="db-confetti-container" aria-hidden="true">
          {confettiValues.map((val, i) => (
            <div
              key={`${confettiKey}-${i}`}
              className="db-confetti-particle"
              style={{
                '--confetti-delay': `${val.delay}s`,
                '--confetti-x': `${val.x}px`,
                '--confetti-y': `${val.y}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <div className="db-panel db-table-panel">
        <table className="db-table">
          <thead>
            <tr>
              <th className="db-th-check">
                <input
                  type="checkbox"
                  className="db-row-check"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Seleccionar todos"
                />
              </th>
              <th>PRODUCTO</th>
              <th>CATEGORIA</th>
              <th>PRECIO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Package}
                    titulo="¡Hola! Aquí aparecerán tus productos"
                    descripcion="Agrega tu primer producto para comenzar a vender. Solo necesitas nombre, precio y una imagen."
                    paso={{ numero: 1, total: 3, texto: "Paso 1 de 3" }}
                  />
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr
                  key={p.id}
                  className={selected.has(p.id) ? "db-row-selected db-row-animated" : ""}
                >
                  <td className="db-td-check">
                    <input
                      type="checkbox"
                      className="db-row-check"
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      aria-label={`Seleccionar ${p.nombre}`}
                    />
                  </td>
                  <td>
                    <div className="db-product-cell">
                      <div
                        className="db-product-avatar"
                        style={
                          p.imagen_url
                            ? undefined
                            : {
                                background: "rgba(148, 163, 184, 0.15)",
                                color: "var(--db-text-muted)",
                              }
                        }
                      >
                        {p.imagen_url ? (
                          <img 
                            src={urlImagen(p.imagen_url)} 
                            alt={p.nombre} 
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          p.marca?.nombre?.[0] || "?"
                        )}
                      </div>
                      <div>
                        <p className="db-product-name">{p.nombre}</p>
                        <p className="db-product-brand">{p.marca?.nombre}</p>
                        {p.estado !== undefined && (
                          <span
                            className={`db-badge db-badge-${p.estado ? "success" : "muted"}`}
                            title={`Ver ${p.estado ? "Activo" : "Inactivo"} ${p.nombre || "producto"}`}
                          >
                            {p.estado ? "Activo" : "Inactivo"}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="db-category">{p.categoria?.nombre}</span>
                  </td>
                  <td>
                    <div className="db-price-cell">
                      <span className="db-price">
                        ${p.precio.toLocaleString("es-CO")}
                      </span>
                      {p.precio_descuento && (
                        <span className="db-price-original">
                          ${p.precio_descuento.toLocaleString("es-CO")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="db-tags">
                      {p.es_destacado && (
                        <span className="db-tag db-tag-green">
                          <Star size={10} /> destacado
                        </span>
                      )}
                      {p.es_nuevo && (
                        <span className="db-tag db-tag-purple">nuevo</span>
                      )}
                      {!p.es_destacado && !p.es_nuevo && (
                        <span className="db-tag-dash">&mdash;</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <ModalProduct
                      producto={p}
                      marcas={marcas}
                      categorias={categorias}
                      onSave={onSave}
                      onDelete={onDelete}
                      estado={p.estado}
                      accion={true}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
