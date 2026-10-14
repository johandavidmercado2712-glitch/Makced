"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import "./FiltroPrecio.css"

interface FiltroPrecioProps {
  maxPrice: number
}

export default function FiltroPrecio({ maxPrice }: FiltroPrecioProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentMax = searchParams.get("maxPrice")
  const initialPrice = currentMax ? Number(currentMax) : maxPrice

  // Valor numérico para el label "hasta $X"
  const [price, setPrice] = useState(initialPrice)
  // Texto crudo del input
  const [inputValue, setInputValue] = useState(String(initialPrice))
  // Error de validación al confirmar
  const [error, setError] = useState(false)

  // Navegación ÚNICA al confirmar, en transition (sin parpadeo, sin historial)
  const syncUrl = useCallback((value: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value >= maxPrice) {
      params.delete("maxPrice")
    } else {
      params.set("maxPrice", String(value))
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, maxPrice, router])

  // Confirmar: validar y sincronizar con la URL
  const confirmValue = useCallback(() => {
    const parsed = Number(inputValue)

    if (inputValue.trim() === "" || !Number.isFinite(parsed) || parsed < 0 || parsed > maxPrice) {
      setError(true)
      return
    }

    setError(false)
    setPrice(parsed)
    syncUrl(parsed)
  }, [inputValue, maxPrice, syncUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputValue(v)
    setError(false)
    const n = Number(v)
    if (v.trim() !== "" && Number.isFinite(n) && n >= 0) {
      setPrice(n)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      confirmValue()
    }
  }

  const handleBlur = () => {
    confirmValue()
  }

  return (
    <div className="div2">
      <div className="filtro-precio">
        <span className={`filtro-precio-texto ${isPending ? "filtro-precio-texto--pending" : ""}`}>
          hasta ${price.toLocaleString("es-CO")}
        </span>
        <div className="filtro-precio-input-wrapper">
          <span className="filtro-precio-input-prefix">$</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={maxPrice}
            step={1000}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`filtro-precio-input ${error ? "filtro-precio-input--error" : ""}`}
            aria-label="Precio máximo"
            aria-invalid={error}
          />
        </div>
      </div>
    </div>
  )
}
