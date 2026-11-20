"use client"
import { useEffect, useState, useRef } from "react"
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
  const [flying, setFlying] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 2000)
    return () => clearTimeout(timer)
  }, [added])

  const handleAdd = () => {
    if (disabled) return
    addItem(producto, talla ?? undefined, color ?? undefined)
    setAdded(true)

    // Trigger fly-to-cart animation
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const cartBtn = document.querySelector('[aria-label^="Carrito"]') as HTMLElement
      if (cartBtn) {
        const cartRect = cartBtn.getBoundingClientRect()
        const dot = document.createElement('div')
        dot.className = 'fly-to-cart-dot'
        dot.style.left = `${rect.left + rect.width / 2}px`
        dot.style.top = `${rect.top + rect.height / 2}px`
        dot.style.setProperty('--fly-x', `${cartRect.left + cartRect.width / 2 - rect.left - rect.width / 2}px`)
        dot.style.setProperty('--fly-y', `${cartRect.top + cartRect.height / 2 - rect.top - rect.height / 2}px`)
        document.body.appendChild(dot)
        setTimeout(() => dot.remove(), 600)
      }
    }
  }

  return (
    <button
      ref={buttonRef}
      className={`cta-btn ${added ? "cta-btn--added" : ""} ${flying ? "cta-btn--flying" : ""}`}
      onClick={handleAdd}
      disabled={disabled}
    >
      {disabled ? (
        <>Selecciona una talla</>
      ) : added ? (
        <><Check size={18} /> Agregado ✓</>
      ) : (
        <><ShoppingBag size={18} /> Agregar al carrito</>
      )}
    </button>
  )
}
