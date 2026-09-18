import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { ProductCardProps } from "../types/store"
import "./ProductCard.css"

interface ProductCardExtendedProps extends ProductCardProps {
  className?: string
}

export default function ProductCard({ image, name, price, rating, slug, className = "Productos-card" }: ProductCardExtendedProps) {
  const content = (
    <div className={className}>
      <Image src={image} alt={name} width={200} height={150}/>
      <h2>{name}</h2>
      <p>{price}</p>
      {slug && <span className="product-link">Ver Producto</span>}
      <div className="product-rating">
        <Star size={14} /> {rating}
      </div>
    </div>
  )

  if (!slug) return content
  return <Link href={`/verProducto?slug=${slug}`}>{content}</Link>
}
