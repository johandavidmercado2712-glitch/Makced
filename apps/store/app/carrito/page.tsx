"use client"

import "./carrito.css"
import {
  ArrowRight,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";

const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatPrice = (value: number) => formatter.format(value);

export default function Page() {
  const subtotal = 0;
  const itemsCount = 1;
  const shipping = 0;
  const total = subtotal + shipping;
  const freeShipping = shipping === 0;

  return (
    <div className="carrito-parent">
      <div className="carrito-header">
        <h1>Tu Carrito</h1>
      </div>

      <div className="carrito-products">
        <div className="carrito-product-card">
          <img className="carrito-product-img" src="/producto.jpg" alt="Producto" />
          <div className="carrito-product-info">
            <span className="carrito-product-name">Nombre Producto</span>
            <p className="carrito-product-desc">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non
              dolor augue. Nunc dictum erat sit amet iaculis interdum.
            </p>
          </div>
        </div>
      </div>

      <div className="carrito-summary">
        <div className="carrito-resumen">
          <div className="carrito-envio-banner">
            <div className="carrito-envio-text">
              <Truck size={20} />
              <span>
                {freeShipping
                  ? "¡Felicitaciones! "
                  : "Completa tu pedido para obtener tu productos"}
              </span>
            </div>
            <div className="carrito-envio-bar">
              <div className="carrito-envio-fill" style={{ width: freeShipping ? "100%" : "75%" }} />
            </div>
          </div>

          <div className="carrito-resumen-content">
            <h2 className="carrito-resumen-title">Resumen del pedido</h2>

            <div className="carrito-linea">
              <span className="carrito-linea-label">Subtotal ({itemsCount} producto)</span>
              <span className="carrito-linea-valor">{formatPrice(subtotal)}</span>
            </div>
            <div className="carrito-linea">
              <span className="carrito-linea-label">Envío</span>
              <span className={`carrito-linea-valor ${freeShipping ? "carrito-linea-valor--gratis" : ""}`}>
                {freeShipping ? "Gratis" : formatPrice(shipping)}
              </span>
            </div>

            <hr className="carrito-separador" />

            <div className="carrito-total">
              <span className="carrito-total-label">Total</span>
              <span className="carrito-total-valor">{formatPrice(total)}</span>
            </div>
            <button type="button" className="login-submit" style={{ marginTop: "12px" }}>
              <MessageCircle size={20} /> Pedir por WhatsApp
            </button>

            <div className="carrito-beneficios">
              <div className="carrito-beneficio"><LockKeyhole size={16} /> <span>Pago seguro</span></div>
              <div className="carrito-beneficio"><Truck size={16} /> <span>Envíos nacionales</span></div>
              <div className="carrito-beneficio"><ShieldCheck size={16} /> <span>Garantía</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
