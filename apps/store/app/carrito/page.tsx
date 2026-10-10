"use client"

import "./carrito.css"
import Link from "next/link"
import {
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "../../components/auth/CartContext";

const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatPrice = (value: number) => formatter.format(value);

const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_COST = 15000;

export default function Page() {
  // ─── CONSUMIR CARRITO ───────────────────────────────────────
  // useCart() lee el CartContext que envuelve toda la app en layout.tsx
  // Devuelve: items[], subtotal, totalItems, y funciones de mutación
  const {
    items,
    subtotal,
    totalItems,
    showPrices,
    updateQty,
    removeItem,
    clearCart,
  } = useCart();

  // ─── LÓGICA DE ENVÍO ────────────────────────────────────────
  // Envío gratis si el subtotal supera el umbral ($200.000)
  // Si el carrito está vacío, envío = 0 (no mostramos costo)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const freeShipping = shipping === 0;

  // ─── MENSAJE DE WHATSAPP ────────────────────────────────────
  // Construye un mensaje codificado con los items del carrito
  const whatsappMessage = encodeURIComponent(
    showPrices
      ? `Hola, quiero pedir:\n` +
          items
            .map(
              (i) =>
                `- ${i.nombre} x${i.cantidad} ${formatPrice(i.precio * i.cantidad)}`
            )
            .join("\n") +
          `\n\nTotal: ${formatPrice(total)}`
      : `Hola, quiero consultar el precio de estos productos:\n` +
          items
            .map((i) => `- ${i.nombre} x${i.cantidad}`)
            .join("\n") +
          "\n\nPor favor, confírmame los precios y el costo de envío."
  );

  // ─── ESTADO VACÍO ───────────────────────────────────────────
  // Si no hay items, mostramos un mensaje con link para explorar
  if (items.length === 0) {
    return (
      <div className="carrito-parent">
        <div className="carrito-header">
          <h1>Tu Carrito</h1>
        </div>
        <div className="carrito-vacio">
          <ShoppingCart size={64} />
          <p>Tu carrito está vacío</p>
          <Link href="/">Explorar productos</Link>
        </div>
      </div>
    );
  }

  // ─── RENDER PRINCIPAL ───────────────────────────────────────
  return (
    <div className="carrito-parent">
      <div className="carrito-header">
        <h1>Tu Carrito ({totalItems} {totalItems === 1 ? "producto" : "productos"})</h1>
        {items.length > 0 && (
          <button className="carrito-vaciar" onClick={clearCart}>
            <Trash2 size={14} /> Vaciar carrito
          </button>
        )}
      </div>

      {/* ─── LISTA DE ITEMS ─────────────────────────────────── */}
      <div className="carrito-products">
        {items.map((item) => (
          // Key única: id + talla (permite mismo producto en distintas tallas)
          <div key={`${item.id}-${item.talla ?? ""}-${item.color ?? ""}`} className="carrito-product-card">
            {/* IMAGEN del producto */}
            <img
              className="carrito-product-img"
              src={item.imagen_url}
              alt={item.nombre}
            />

            {/* INFORMACIÓN: nombre, talla/color, controles cantidad */}
            <div className="carrito-product-info">
              <span className="carrito-product-name">{item.nombre}</span>

              {/* Mostrar talla solo si existe */}
              {item.talla && (
                <span className="carrito-product-talla">Talla: {item.talla}</span>
              )}

              {/* Mostrar color solo si existe */}
              {item.color && (
                <span className="carrito-product-color">{item.color}</span>
              )}

              {/* CONTROLES DE CANTIDAD */}
              <div className="carrito-cantidad">
                <button
                  onClick={() => updateQty(item.id, item.cantidad - 1, item.talla, item.color)}
                  aria-label="Reducir cantidad"
                >
                  -
                </button>
                <span>{item.cantidad}</span>
                <button
                  onClick={() => updateQty(item.id, item.cantidad + 1, item.talla, item.color)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>

            {/* PRECIO TOTAL + BOTÓN ELIMINAR */}
            <div className="carrito-product-right">
              {showPrices && (
                <span className="carrito-product-precio">
                  {formatPrice(item.precio * item.cantidad)}
                </span>
              )}
              <button
                className="carrito-product-eliminar"
                onClick={() => removeItem(item.id, item.talla, item.color)}
                aria-label={`Eliminar ${item.nombre}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── RESUMEN DEL PEDIDO ──────────────────────────────── */}
      <div className="carrito-summary">
        <div className="carrito-resumen">
          {/* BANNER DE ENVÍO con barra de progreso */}
          <div className="carrito-envio-banner">
            <div className="carrito-envio-text">
              <Truck size={20} />
              <h1>Distruta Tu Pedido!</h1>
            </div>
          </div>

          <div className="carrito-resumen-content">
            <h2 className="carrito-resumen-title">Resumen del pedido</h2>

            {showPrices ? (
              <>
                <div className="carrito-linea">
                  <span className="carrito-linea-label">
                    Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})
                  </span>
                  <span className="carrito-linea-valor">{formatPrice(subtotal)}</span>
                </div>

                <div className="carrito-linea">
                  <span className="carrito-linea-label">Envío</span>
                  <span
                    className={`carrito-linea-valor ${freeShipping ? "carrito-linea-valor--gratis" : ""}`}
                  >
                    {freeShipping ? "Gratis" : formatPrice(shipping)}
                  </span>
                </div>

                <hr className="carrito-separador" />

                <div className="carrito-total">
                  <span className="carrito-total-label">Total</span>
                  <span className="carrito-total-valor">{formatPrice(total)}</span>
                </div>
              </>
            ) : (
              <p className="carrito-precio-consulta">
                Los precios y el costo de envío se confirmarán al solicitar tu pedido.
              </p>
            )}

            {/* Botón WhatsApp con mensaje pre-cargado */}
            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="login-submit"
              style={{ marginTop: "12px" }}
            >
              <MessageCircle size={20} /> Pedir por WhatsApp
            </a>

            {/* Beneficios de confianza */}
            <div className="carrito-beneficios">
              <div className="carrito-beneficio">
                <LockKeyhole size={16} /> <span>Pago seguro</span>
              </div>
              <div className="carrito-beneficio">
                <Truck size={16} /> <span>Envíos nacionales</span>
              </div>
              <div className="carrito-beneficio">
                <ShieldCheck size={16} /> <span>Garantía</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
