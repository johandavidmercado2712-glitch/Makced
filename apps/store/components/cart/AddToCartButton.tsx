"use client"
import { useEffect, useState } from "react"
import { ShoppingBag, Check } from "lucide-react"
import { useCart } from "../auth/CartContext"
import { ProductoCart } from "@/types/cart"

interface Props {
  producto: ProductoCart
  talla?: number | null
  color?: string | null
  disabled?: boolean
}

export default function AddToCartButton({ producto, talla, color, disabled }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 2000)
    return () => clearTimeout(timer)
  }, [added])

  const handleAdd = () => {
    if (disabled) return
    addItem(producto, talla ?? undefined, color ?? undefined)
    setAdded(true)
  }

  return (
    <button
      className={`cta-btn ${added ? "cta-btn--added" : ""}`}
      onClick={handleAdd}
      disabled={disabled}
    >
      {disabled ? (
        <>Selecciona una talla</>
      ) : added ? (
        <><Check size={18} /> Agregado ✓</>
      ) : (
        <><ShoppingBag size={18} /> Agregar a la bolsa</>
      )}
    </button>
  )
}
