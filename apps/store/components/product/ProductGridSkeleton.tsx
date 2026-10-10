import ProductCard from "./ProductCard"

export default function ProductGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="Productos-cards">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCard key={i} loading />
      ))}
    </div>
  )
}
