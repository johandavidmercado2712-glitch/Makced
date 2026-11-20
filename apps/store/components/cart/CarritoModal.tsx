import { type CartItem } from "../../types/cart";

interface CarritoModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  setUndo: (items: CartItem[] | null) => void;
  clearCart: () => void;
  setConfirmOpen: (open: boolean) => void;
}

export default function CarritoModal({
  open,
  onClose,
  items,
  setUndo,
  clearCart,
  setConfirmOpen,
}: CarritoModalProps) {
  if (!open) return null;

  return (
    <dialog className="carrito-modal-overlay" open aria-modal="true" aria-labelledby="carrito-modal-title">
      <div className="carrito-modal">
        <h2 id="carrito-modal-title">¿Vaciar el carrito?</h2>
        <p>Se eliminarán todos los productos. Esta acción no se puede deshacer.</p>
        <div className="carrito-modal-actions">
          <button className="carrito-modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="carrito-modal-confirm"
            onClick={() => {
              setUndo(items);
              clearCart();
              setConfirmOpen(false);
              setTimeout(() => setUndo(null), 5000);
            }}
          >
            Vaciar
          </button>
        </div>
      </div>
    </dialog>
  );
}
