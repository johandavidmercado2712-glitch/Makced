"use client";

// Las miniaturas del panel renderizan URLs de Storage (InsForge) y previews
// `blob:` generadas con URL.createObjectURL (ImagenSelector). `next/image`
// rechaza `blob:`, exige `remotePatterns` y añade width/height o fill →
// regresión de layout sin ganancia en un panel tras autenticación.
/* eslint-disable @next/next/no-img-element */

import { useCallback } from "react";
import { Box, Tag, ImageIcon } from "lucide-react";
import {
  eliminarCategoria,
  eliminarMarca,
  guardarCategoria,
  guardarMarca,
  restaurarCategoria,
  restaurarMarca,
} from "@/actions/marcas";
import { ModalCategoria } from "@/components/modal/modalCategoria";
import { ModalMarca } from "@/components/modal/modalMarca";
import { EmptyState } from "@/components/EmptyState";
import { Toast } from "@/components/Toast";
import { useUndoToast } from "@/hooks/useUndoToast";
import { urlImagen } from "@/lib/imagenes";
import type { MarcaAdmin, CategoriaAdmin } from "@/types/database";
import "../app/productos/productos.css";
import "../app/marcas/marcas.css";

interface MarcasWithUndoProps {
  marcas: MarcaAdmin[];
  categorias: CategoriaAdmin[];
}

export function MarcasWithUndo({ marcas, categorias }: MarcasWithUndoProps) {
  const { state: toastState, show: showToast, hide: hideToast, undo } = useUndoToast();

  const handleEliminarMarca = useCallback(
    async (id: string) => {
      const result = await eliminarMarca(id);
      if (result.ok) {
        showToast("Marca eliminada", async () => {
          await restaurarMarca(id);
        });
      }
      return result;
    },
    [showToast],
  );

  const handleEliminarCategoria = useCallback(
    async (id: string) => {
      const result = await eliminarCategoria(id);
      if (result.ok) {
        showToast("Categoría eliminada", async () => {
          await restaurarCategoria(id);
        });
      }
      return result;
    },
    [showToast],
  );

  return (
    <>
      {/* Sección de Marcas */}
      <section className="db-entity-section">
        <div className="db-section-header">
          <Tag size={16} />
          <div className="db-section-titles">
            <h2>Marcas</h2>
            <p>Agrupan tus productos por fabricante.</p>
          </div>
          <span className="db-filters-count">{marcas.length}</span>
        </div>

        {marcas.length === 0 ? (
          <div className="db-panel">
            <EmptyState
              icon={Tag}
              titulo="¡Hola! Aquí aparecerán tus marcas"
              descripcion="Las marcas agrupan tus productos por fabricante. Aparecen en los filtros de la tienda y ayudan a tus clientes a encontrar lo que buscan."
            />
          </div>
        ) : (
          <div className="db-entity-grid">
            {marcas.map((m) => (
              <article key={m.id} className="db-entity-card">
                <div className="db-entity-visual">
                  {m.logo_url ? (
                    <img
                      src={urlImagen(m.logo_url)}
                      alt={m.nombre}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <ImageIcon size={36} aria-hidden="true" />
                  )}
                </div>
                <div className="db-entity-content">
                  <div className="db-entity-heading">
                    <h3>{m.nombre}</h3>
                    <span
                      className={`db-entity-status ${m.activa ? "db-entity-status-active" : ""}`}
                    >
                      {m.activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <div className="db-actions">
                    <ModalMarca
                      entidad={m}
                      onSave={guardarMarca}
                      onDelete={handleEliminarMarca}
                      estado={m.activa}
                      accion={true}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Sección de Categorías */}
      <section className="db-entity-section">
        <div className="db-section-header">
          <Box size={16} />
          <div className="db-section-titles">
            <h2>Categorías</h2>
            <p>Las secciones en las que se divide tu catálogo.</p>
          </div>
          <span className="db-filters-count">{categorias.length}</span>
        </div>

        {categorias.length === 0 ? (
          <div className="db-panel">
            <EmptyState
              icon={Box}
              titulo="¡Hola! Aquí aparecerán tus categorías"
              descripcion="Las categorías organizan tu catálogo en secciones. Tus clientes las usan para navegar y filtrar productos en la tienda."
            />
          </div>
        ) : (
          <div className="db-entity-grid">
            {categorias.map((c) => (
              <article key={c.id} className="db-entity-card">
                <div className="db-entity-visual">
                  {c.imagen_url ? (
                    <img
                      src={urlImagen(c.imagen_url)}
                      alt={c.nombre}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <ImageIcon size={36} aria-hidden="true" />
                  )}
                </div>
                <div className="db-entity-content">
                  <div className="db-entity-heading">
                    <h3>{c.nombre}</h3>
                    <span className="db-entity-slug">{c.slug}</span>
                    <span
                      className={`db-entity-status ${c.activa ? "db-entity-status-active" : ""}`}
                    >
                      {c.activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <div className="db-actions">
                    <ModalCategoria
                      entidad={c}
                      onSave={guardarCategoria}
                      onDelete={handleEliminarCategoria}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Toast state={toastState} onUndo={undo} onDismiss={hideToast} />
    </>
  );
}
