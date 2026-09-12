import Image from "next/image"
import { Star } from "lucide-react"
import { ProductCardProps } from "../types/store"
import "./ProductCard.css"

interface ProductCardExtendedProps extends ProductCardProps {
  className?: string
}

export default function ProductCard({ image, name, price, rating, className = "Productos-card" }: ProductCardExtendedProps) {
  return (
    <div className={className}>
      <Image src={image} alt={name} width={200} height={150}/>
      <h2>{name}</h2>
      <p>{price}</p>
      <div className="product-rating">
        <Star size={14} /> {rating}
      </div>
    </div>
  )
}
