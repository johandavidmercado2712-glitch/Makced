"use client"

import { useState, useRef, useCallback, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import "./FiltroPrecio.css"

interface FiltroPrecioProps {
  maxPrice: number
}

export default function FiltroPrecio({ maxPrice }: FiltroPrecioProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  const currentMax = searchParams.get("maxPrice")
  const initialPrice = currentMax ? Number(currentMax) : maxPrice
  const [price, setPrice] = useState(initialPrice)

  // Ref del precio más reciente — evita stale closures en mouseup/touchend
  const priceRef = useRef(initialPrice)

  // Marca si el teclado cambió el precio pendiente de sync (keyup)
  const dirtyRef = useRef(false)

  const percentage = (price / maxPrice) * 100

  // Cálculo puro: clientX → precio redondeado a múltiplos de 1000
  const priceFromX = useCallback((clientX: number): number => {
    const slider = sliderRef.current
    if (!slider) return priceRef.current
    const rect = slider.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round((percent * maxPrice) / 1000) * 1000
  }, [maxPrice])

  // Solo estado visual: mueve el slider al instante, SIN navegar
  const applyPrice = useCallback((clientX: number) => {
    const newPrice = priceFromX(clientX)
    priceRef.current = newPrice
    setPrice(newPrice)
  }, [priceFromX])

  // Navegación ÚNICA al soltar, en transition (sin parpadeo, sin historial)
  const syncUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (priceRef.current >= maxPrice) {
      params.delete("maxPrice")
    } else {
      params.set("maxPrice", String(priceRef.current))
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, maxPrice, router])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    applyPrice(e.clientX)

    const handleMouseMove = (e: MouseEvent) => {
      applyPrice(e.clientX)
    }

    const handleMouseUp = (e: MouseEvent) => {
      applyPrice(e.clientX)
      syncUrl()
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    applyPrice(e.touches[0].clientX)

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      applyPrice(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
      syncUrl()
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
  }

  // Teclado: mismo patrón que drag — estado al presionar, sync al soltar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = 1000
    let newPrice = priceRef.current

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        newPrice = Math.min(maxPrice, priceRef.current + step)
        break
      case "ArrowLeft":
      case "ArrowDown":
        newPrice = Math.max(0, priceRef.current - step)
        break
      case "Home":
        newPrice = 0
        break
      case "End":
        newPrice = maxPrice
        break
      default:
        return // no interceptar Tab, Escape, etc.
    }

    e.preventDefault() // evita scroll de la página con las flechas
    if (newPrice !== priceRef.current) {
      priceRef.current = newPrice
      setPrice(newPrice)  // visual instantáneo
      dirtyRef.current = true
    }
  }

  const handleKeyUp = () => {
    if (dirtyRef.current) {
      dirtyRef.current = false
      syncUrl() // 1 navegación al soltar (igual que mouseup)
    }
  }

  return (
    <div className="div2">
      <div className="filtro-precio">
        <span className={`filtro-precio-texto ${isPending ? "filtro-precio-texto--pending" : ""}`}>
          hasta ${price.toLocaleString("es-CO")}
        </span>
        <div
          className="filtro-precio-slider"
          ref={sliderRef}
          role="slider"
          tabIndex={0}
          aria-label="Precio máximo"
          aria-valuemin={0}
          aria-valuemax={maxPrice}
          aria-valuenow={price}
          aria-valuetext={`hasta $${price.toLocaleString("es-CO")}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        >
          <div
            className="filtro-precio-track"
            style={{
              background: `linear-gradient(to right, var(--primary-mint) ${percentage}%, var(--border-color) ${percentage}%)`
            }}
          />
          <div
            className="filtro-precio-thumb"
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
