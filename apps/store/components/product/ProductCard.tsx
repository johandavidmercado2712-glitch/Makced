"use client"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { ProductCardProps } from "../../types/store"
import "./ProductCard.css"

interface ProductCardExtendedProps {
  image?: string
  name?: string
  price?: string | undefined
  rating?: number
  slug?: string
  className?: string
  loading?: boolean
}

export default function ProductCard({ image = "/producto.jpg", name = "", price, rating = 4.5, slug, className = "Productos-card", loading }: ProductCardExtendedProps) {
  if (loading) {
    return (
      <div className={`${className} loading`}>
        <div className="product-image-wrapper">
          <div className="skeleton h-full w-full"></div>
        </div>
        <div className="product-content">
          <div className="flex items-center gap-3">
            <div className="skeleton h-4 w-16 shrink-0"></div>
            <div className="skeleton h-4 w-24"></div>
          </div>
          <div className="skeleton h-5 w-20 mt-3"></div>
        </div>
      </div>
    )
  }

  const content = (
    <div className={className}>
      <div className="product-image-wrapper">
        <Image src={image} alt={name} fill sizes="(max-width: 768px) 50vw, 25vw" />
        <div className="product-rating">
          <Heart size={28} className="heart-icon" />
          <div className="heart-tooltip">
            Añadir al carrito
          </div>
        </div>
      </div>
      <div className="product-content">
        <p className="product-marca">Deportivo</p>
        <h2 className="product-nombre">{name}</h2>
        <div className="product-precio-fila">
          {typeof price !== "undefined" && (
            <p className="product-precio">{price}</p>
          )}
        </div>
      </div>
    </div>
  )

  if (!slug) return content
  return <Link href={`/verProducto?slug=${slug}`}>{content}</Link>
}
