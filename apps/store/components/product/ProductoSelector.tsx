"use client"
import { useState } from "react"
import { Palette, Ruler } from "lucide-react"
import { ProductoCart } from "@/types/cart"
import AddToCartButton from "../cart/AddToCartButton"

interface Props {
  producto: ProductoCart & { colores?: { nombre: string; hex: string }[] }
}


export default function ProductoSelector({ producto }: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedTalla, setSelectedTalla] = useState<number | null>(null)



  return (
    <>
      {/* COLOR (opcional) */}
      <div className="producto-colores" role="group" aria-labelledby="lbl-color">
        <span id="lbl-color" className="producto-label"><Palette size={16} /> Color</span>
        <div className="colores-swatches">
          {producto.colores?.map((color) => (
            <button
              key={color.nombre}
              className={`color-swatch ${selectedColor === color.nombre ? "selected" : ""}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => setSelectedColor(color.nombre)}
              title={color.nombre}
              aria-label={color.nombre}
              aria-pressed={selectedColor === color.nombre}
              type="button"
            />
          ))}
        </div>
      </div>

      {/* TALLA (obligatoria) */}
      <div className="producto-tallas" role="group" aria-labelledby="lbl-talla">
        <span id="lbl-talla" className="producto-label"><Ruler size={16} /> Talla</span>
        <div className="tallas-grid">
          {[35,36,37,38,39,40,41,42,43,44,45,46].map((talla) => (
            <button
              key={talla}
              className={`talla-btn ${selectedTalla === talla ? "selected" : ""}`}
              onClick={() => setSelectedTalla(talla)}
              aria-pressed={selectedTalla === talla}
              type="button"
            >
              {talla}
            </button>
          ))}
        </div>
        {/* Feedback si no seleccionó talla */}
        {!selectedTalla && (
          <span className="producto-talla-requerida">Selecciona una talla</span>
        )}
      </div>

      {/* CTA con validación */}
      <AddToCartButton
        producto={producto}
        talla={selectedTalla}
        color={selectedColor}
        disabled={!selectedTalla}
      />
    </>
  )
}