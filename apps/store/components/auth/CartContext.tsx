"use client"

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useMemo,
  useCallback,
  ReactNode,
} from "react"
import { CartItem, CartContextValue, ProductoCart } from "../../types/cart"
import { precioEfectivo } from "../../lib/format"

const STORAGE_KEY = "makced-cart"
const EMPTY: CartItem[] = []

// ═════════════════════════════════════════════════════════════
// 1. STORE EXTERNO — localStorage como fuente de verdad
// ═════════════════════════════════════════════════════════════

let cache: CartItem[] = EMPTY
let cacheRaw: string | null = null
let listeners: Array<() => void> = []

function emitChange() {
  listeners.forEach((l) => l())
}

function esCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === "string" &&
    typeof item.slug === "string" &&
    typeof item.nombre === "string" &&
    typeof item.imagen_url === "string" &&
    typeof item.precio === "number" &&
    Number.isFinite(item.precio) &&
    item.precio >= 0 &&
    typeof item.cantidad === "number" &&
    Number.isInteger(item.cantidad) &&
    item.cantidad > 0
  )
}

// React llama esto para suscribirse a cambios del store
function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

// Cliente: leer localStorage con cache (misma referencia si no cambió)
function getSnapshot(): CartItem[] {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    // Storage bloqueado (modo privado, permisos): usar lo que haya en memoria.
    return cache
  }

  if (raw !== cacheRaw) {
    cacheRaw = raw
    if (!raw) {
      cache = EMPTY
      return cache
    }
    try {
      const parsed: unknown = JSON.parse(raw)
      cache = Array.isArray(parsed) ? parsed.filter(esCartItem) : EMPTY
    } catch {
      cache = EMPTY
    }
  }
  return cache
}

// SSR/hydración: carrito vacío (coincide con el HTML del servidor)
function getServerSnapshot(): CartItem[] {
  return EMPTY
}

// Escribir: cache + localStorage + notificar a React
function write(next: CartItem[]) {
  cache = next
  const serialized = JSON.stringify(next)
  cacheRaw = serialized

  try {
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch {
    // Sin persistencia (cuota/permisos): el carrito sigue en memoria.
    try {
      cacheRaw = localStorage.getItem(STORAGE_KEY)
    } catch {
      // Storage inaccesible: getSnapshot devuelve el cache en memoria.
    }
  }

  emitChange()
}

// Sync entre pestañas (el evento storage solo llega a OTRAS pestañas)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) emitChange()
  })
}

// ═════════════════════════════════════════════════════════════
// 2. CONTEXT
// ═════════════════════════════════════════════════════════════

const CartContext = createContext<CartContextValue>({
  items: [],
  totalItems: 0,
  subtotal: 0,
  showPrices: true,
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
})

// ═════════════════════════════════════════════════════════════
// 3. PROVIDER
// ═════════════════════════════════════════════════════════════

export function CartProvider({
  children,
  showPrices = true,
}: {
  children: ReactNode;
  showPrices?: boolean;
}) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.cantidad, 0),
    [items]
  )
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [items]
  )

  // ═══════════════════════════════════════════════════════════
  // 4. MUTACIONES — escriben directo al store (sin setState)
  // ═══════════════════════════════════════════════════════════

  const addItem = useCallback(
    (product: ProductoCart, talla?: number, color?: string) => {
      const current = getSnapshot()
      const existingIndex = current.findIndex(
        (i) => i.id === product.id && i.talla === talla && i.color === color
      )

      if (existingIndex >= 0) {
        const updated = [...current]
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + 1,
        }
        write(updated)
        return
      }

      const precio = precioEfectivo(product.precio, product.precio_descuento)
      if (!Number.isFinite(precio) || precio < 0) return

      const newItem: CartItem = {
        id: product.id,
        slug: product.slug || "",
        nombre: product.nombre,
        precio,
        imagen_url: product.imagen_url || "/producto.jpg",
        cantidad: 1,
        talla,
        color,
      }
      write([...current, newItem])
    },
    []
  )

  const removeItem = useCallback(
    (id: string, talla?: number, color?: string) => {
      write(
        getSnapshot().filter(
          (item) =>
            !(item.id === id && item.talla === talla && item.color === color)
        )
      )
    },
    []
  )

  const updateQty = useCallback(
    (id: string, qty: number, talla?: number, color?: string) => {
      const cantidad = Math.floor(qty)
      if (!Number.isFinite(qty) || cantidad <= 0) {
        removeItem(id, talla, color)
        return
      }
      write(
        getSnapshot().map((item) =>
          item.id === id && item.talla === talla && item.color === color
            ? { ...item, cantidad }
            : item
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => write([]), [])

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      showPrices,
      addItem,
      removeItem,
      updateQty,
      clearCart,
    }),
    [items, totalItems, subtotal, showPrices, addItem, removeItem, updateQty, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ═════════════════════════════════════════════════════════════
// 5. HOOK
// ═════════════════════════════════════════════════════════════

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}
