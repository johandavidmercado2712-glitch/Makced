"use client"


import "./carrito.css"
import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react";
import { useCart } from "../../components/auth/CartContext";
import { CartItem } from "../../types/cart";
import CartItemCard from "../../components/cart/CartItemCard";
import CarritoVacio from "../../components/cart/CarritoVacio";
import CarritoModal from "../../components/cart/CarritoModal";
import CarritoResumen from "../../components/cart/CarritoResumen";
import { formatCOP } from "../../lib/format";
import { insforge } from "../../lib/insforge";
import { useTenant } from "../../components/tenant/TenantProvider";


const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_COST = 15000;


export default function Page() {
  const { subdominio } = useTenant();
  // ─── CONSUMIR CARRITO ───────────────────────────────────────
  const {
    items,
    subtotal,
    totalItems,
    showPrices,
    updateQty,
    removeItem,
    clearCart,
    restoreCart,
  } = useCart();

  // ─── LÓGICA DE ENVÍO ────────────────────────────────────────
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  // ─── WHATSAPP DE LA TIENDA ──────────────────────────────────
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 0); return () => clearTimeout(t); }, []);

  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [undo, setUndo] = useState<CartItem[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);
  const [whatsappNumero, setWhatsappNumero] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const { data } = await insforge.database
          .from("tiendas")
          .select("whatsapp_numero")
          .eq("subdominio", subdominio) 
          .eq("activa", true)
          .maybeSingle();
        if (!cancelado) {
          setWhatsappNumero((data as { whatsapp_numero?: string | null } | null)?.whatsapp_numero ?? null);
        }
      } catch {
        // Fallback: sin número, wa.me/?text=
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [subdominio]);

  // ─── MENSAJE DE WHATSAPP ────────────────────────────────────
  const whatsappMessage = encodeURIComponent(
    (showPrices
      ? `Hola, quiero pedir:\n`
      : `Hola, quiero consultar el precio de estos productos:\n y saber si se encuentra disponible . espero su respuesta `) +
      items
        .map(
          (i) =>
            `- ${i.nombre}${i.talla ? ` (Talla ${i.talla})` : ""}${
              i.color ? ` (${i.color})` : ""
            } x${i.cantidad}` +
            (showPrices ? ` ${formatCOP(i.precio * i.cantidad)}` : "")
        )
        .join("\n") +
      (showPrices
        ? `\n\nTotal: ${formatCOP(total)}`
        : "\n\nPor favor, confírmame los precios y el costo de envío.")
  );

  // ─── SKELETON (hidratación) ──────────────────────────────────
  if (!mounted) {
    return (
      <div className="carrito-parent">
        <div className="carrito-header">
          <h1>Tu Carrito</h1>
        </div>
        <div className="carrito-products">
          {[0, 1, 2].map((i) => (
            <div key={i} className="carrito-product-card carrito-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  // ─── ESTADO VACÍO ───────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="carrito-parent">
        <div className="carrito-header">
          <h1>Tu Carrito</h1>
        </div>
        <CarritoVacio />
      </div>
    );
  }

  // ─── RENDER PRINCIPAL ───────────────────────────────────────
  return (
    <>
      <div className="carrito-parent">
        <div className="carrito-header">
          <h1>Tu Carrito ({totalItems} {totalItems === 1 ? "producto" : "productos"})</h1>
          {items.length > 0 && (
            <button
              className="carrito-vaciar"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 size={14} /> Vaciar carrito
            </button>
          )}
        </div>

        {/* ─── LAYOUT: PRODUCTOS + RESUMEN ────────────────────── */}
        <div className="carrito-layout">
          {/* ─── LISTA DE ITEMS ───────────────────────────────── */}
          <div className="carrito-products">
            {items.map((item) => {
              const key = `${item.id}-${item.talla ?? ""}-${item.color ?? ""}`;
              return (
                <CartItemCard
                  key={key}
                  item={item}
                  showPrices={showPrices}
                  isRemoving={removing.has(key)}
                  onDecrease={() => updateQty(item.id, item.cantidad - 1, item.talla, item.color)}
                  onIncrease={() => updateQty(item.id, item.cantidad + 1, item.talla, item.color)}
                  onRemove={() => {
                    setRemoving((prev) => new Set(prev).add(key));
                    setTimeout(() => {
                      removeItem(item.id, item.talla, item.color);
                      setRemoving((prev) => {
                        const next = new Set(prev);
                        next.delete(key);
                        return next;
                      });
                    }, 250);
                  }}
                />
              );
            })}
          </div>

          {/* ─── RESUMEN DEL PEDIDO ───────────────────────────── */}
          <CarritoResumen
            items={items}
            subtotal={subtotal}
            totalItems={totalItems}
            showPrices={showPrices}
            whatsappNumero={whatsappNumero}
            whatsappMessage={whatsappMessage}
          />
        </div>
      </div>

      <CarritoModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        items={items}
        setUndo={setUndo}
        clearCart={clearCart}
        setConfirmOpen={setConfirmOpen}
      />
      {undo && (
        <div className="carrito-toast">
          Carrito vaciado
          <button onClick={() => { restoreCart(undo); setUndo(null); }}>Deshacer</button>
        </div>
      )}
    </>
  );
}
