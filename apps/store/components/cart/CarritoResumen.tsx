import { LockKeyhole, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { formatCOP } from "../../lib/format";
import type { CartItem } from "../../types/cart";

const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_COST = 15000;

interface CarritoResumenProps {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  showPrices: boolean;
  whatsappNumero: string | null;
  whatsappMessage: string;
}

export default function CarritoResumen({
  items,
  subtotal,
  totalItems,
  showPrices,
  whatsappNumero,
  whatsappMessage,
}: CarritoResumenProps) {
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const freeShipping = shipping === 0;

  return (
    <div className="carrito-summary">
      <div className="carrito-resumen">
        {/* BANNER DE ENVÍO con barra de progreso */}
        <div className="carrito-envio-banner">
          <div className="carrito-envio-text">
            <Truck size={20} />
            <p>
              {freeShipping
                ? "¡Tu pedido está completo, listo para enviar!"
                : "¡Ya casi! Revisa tu pedido y envíalo por WhatsApp"}
            </p>
          </div>
          <div
            className="carrito-envio-bar"
            role="progressbar"
            aria-valuenow={Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del pedido"
          >
            <div
              className="carrito-envio-fill"
              style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
            />
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
                <span className="carrito-linea-valor">{formatCOP(subtotal)}</span>
              </div>

              <div className="carrito-linea">
                <span className="carrito-linea-label">Envío</span>
                <span
                  className={`carrito-linea-valor ${freeShipping ? "carrito-linea-valor--gratis" : ""}`}
                >
                  {freeShipping ? "Gratis" : formatCOP(shipping)}
                </span>
              </div>

              <hr className="carrito-separador" />

              <div className="carrito-total">
                <span className="carrito-total-label">Total</span>
                <span className="carrito-total-valor">{formatCOP(total)}</span>
              </div>
            </>
          ) : (
            <p className="carrito-precio-consulta">
              Los precios y el costo de envío se confirmarán al solicitar tu pedido.
            </p>
          )}

          {/* Botón WhatsApp */}
          <a
            href={whatsappNumero ? `https://wa.me/${whatsappNumero}?text=${whatsappMessage}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`carrito-whatsapp ${whatsappNumero ? "" : "carrito-whatsapp--disabled"}`}
            aria-disabled={!whatsappNumero}
            onClick={(e) => {
              if (!whatsappNumero) e.preventDefault();
            }}
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
  );
}
