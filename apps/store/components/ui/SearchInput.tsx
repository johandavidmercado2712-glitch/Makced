"use client";
import { useState, useEffect, useRef } from "react";
import { buscarProductos } from "@/app/actions/products";
import { X } from "lucide-react";
import { formatCOP, precioEfectivo } from "../../lib/format";
import "./search-input.css";

interface SearchResult {
  id: string;
  nombre: string;
  precio: number;
  precio_descuento: number | null;
  imagen_url: string | null;
  slug: string | null;
}

interface Props {
  onClose: () => void;
}

export default function SearchInput({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const termino = query.trim();
    if (termino.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await buscarProductos(termino);
        if (!controller.signal.aborted) {
          setResults(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <input
          id="search-input"
          ref={inputRef}
          type="text"
          placeholder=" "
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (value.trim().length < 2) {
              setResults([]);
            }
          }}
          maxLength={40}
          className="search-input"
        />
        <label htmlFor="search-input" className="search-label">Buscar...</label>
        <button className="search-close" onClick={onClose} aria-label="Cerrar búsqueda">
          <X size={20} />
        </button>
      </div>

      {results.length > 0 && (
        <div className="search-dropdown">
          {results.map((p) => (
            <a
              key={p.id}
              href={p.slug ? `/verProducto?slug=${encodeURIComponent(p.slug)}` : "/"}
              className="search-result"
            >
              <img src={p.imagen_url || "/producto.jpg"} alt={p.nombre} />
              <div>
                <span className="search-result-name">{p.nombre}</span>
                <span className="search-result-price">
                  {formatCOP(precioEfectivo(p.precio, p.precio_descuento))}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
