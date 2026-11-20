"use client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Check, ShoppingCart } from "lucide-react"
import { useCart } from "../auth/CartContext"
import { useRutaTienda } from "../tenant/TenantProvider"
import { formatCOP, precioEfectivo, tieneDescuento } from "../../lib/format"
import type { ProductoCardData } from "../../types/store"
import "./ProductCard.css"

interface ProductCardProps {
  producto?: ProductoCardData
  mostrarPrecios?: boolean
  className?: string
  loading?: boolean
}

export default function ProductCard({
  producto,
  mostrarPrecios = true,
  className = "Productos-card",
  loading,
}: ProductCardProps) {
  const { addItem } = useCart()
  const ruta = useRutaTienda()
  const [agregado, setAgregado] = useState(false)

  useEffect(() => {
    if (!agregado) return
    const timer = setTimeout(() => setAgregado(false), 1500)
    return () => clearTimeout(timer)
  }, [agregado])

  if (loading) {
    return (
      <div className={`${className} loading flex flex-col gap-4 p-4`}>
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-4 w-28"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    )
  }

  if (!producto) return null

  const precio = precioEfectivo(producto.precio, producto.precio_descuento)
  const conDescuento = tieneDescuento(
    producto.precio,
    producto.precio_descuento,
  )

  const agregarAlCarrito = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    addItem(producto)
    setAgregado(true)
  }

  const content = (
    <div className={className}>
      <div className="product-image-wrapper">
        <Image
          src={producto.imagen_url || "/producto.jpg"}
          alt={producto.nombre}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.src = "/producto.jpg";
          }}
        />
        <button
          type="button"
          className={`product-cart-btn ${agregado ? "product-cart-btn--added" : ""}`}
          onClick={agregarAlCarrito}
          aria-label={`Añadir ${producto.nombre} al carrito`}
          title={agregado ? "Agregado" : "Añadir al carrito"}
        >
          {agregado ? <Check size={20} /> : <ShoppingCart size={20} />}
        </button>
      </div>
      <div className="product-content">
        {producto.marca && <p className="product-marca">{producto.marca}</p>}
        <h2 className="product-nombre">{producto.nombre}</h2>
        <div className="product-precio-fila">
          {mostrarPrecios && (
            <>
              <p className="product-precio">{formatCOP(precio)}</p>
              {conDescuento && (
                <s className="product-precio-original">
                  {formatCOP(producto.precio)}
                </s>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  if (!producto.slug) return content
  return (
    <Link href={ruta(`/verProducto?slug=${encodeURIComponent(producto.slug)}`)}>
      {content}
    </Link>
  )
}
