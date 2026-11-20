"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductoGaleria({
  principal,
  referencias,
  nombre,
}: {
  principal: string;
  referencias: string[];
  nombre: string;
}) {
  const images = [principal, ...(referencias || [])].filter(Boolean);
  const [active, setActive] = useState(0);

  return (
    <div className="Producto-img">
      <Image
        src={images[active] || "/producto.jpg"}
        alt={nombre || ""}
        className="producto-imagen-principal"
        width={600}
        height={600}
        priority
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.src = "/producto.jpg";
        }}
      />
      {images.length > 1 && (
        <div className="producto-galeria">
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              className={`producto-miniatura-btn ${i === active ? "is-active" : ""}`}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Vista ${i + 1} de ${nombre}`}
            >
              <Image
                src={url}
                alt={`Vista ${i + 1} de ${nombre}`}
                className="producto-miniatura"
                width={80}
                height={80}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
