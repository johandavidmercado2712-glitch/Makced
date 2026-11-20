"use client";

import { memo } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { CartItem } from "../../types/cart";
import { formatCOP } from "../../lib/format";

interface Props {
  item: CartItem;
  showPrices: boolean;
  isRemoving: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}

function CartItemCard({
  item,
  showPrices,
  isRemoving,
  onDecrease,
  onIncrease,
  onRemove,
}: Props) {
  return (
    <div className={`carrito-product-card ${isRemoving ? "carrito-product-card--removing" : ""}`}>
      <Image
        className="carrito-product-img"
        src={item.imagen_url}
        alt={item.nombre}
        width={80}
        height={80}
        loading="lazy"
      />
      <div className="carrito-product-info">
        <span className="carrito-product-name">{item.nombre}</span>
        {item.talla && <span className="carrito-product-talla">Talla: {item.talla}</span>}
        {item.color && <span className="carrito-product-color">{item.color}</span>}
        <div className="carrito-cantidad">
          <button onClick={onDecrease} aria-label="Reducir cantidad">-</button>
          <span aria-live="polite" aria-atomic="true">{item.cantidad}</span>
          <button onClick={onIncrease} aria-label="Aumentar cantidad">+</button>
        </div>
      </div>
      <div className="carrito-product-right">
        {showPrices && (
          <span className="carrito-product-precio">{formatCOP(item.precio * item.cantidad)}</span>
        )}
        <button
          className="carrito-product-eliminar"
          disabled={isRemoving}
          onClick={onRemove}
          aria-label={`Eliminar ${item.nombre} del carrito`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default memo(CartItemCard);
