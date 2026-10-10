"use client"
import {
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const STORAGE_KEY = "theme"

// ═════════════════════════════════════════════════════════════
// 1. STORE EXTERNO — localStorage como fuente de verdad
// ═════════════════════════════════════════════════════════════

let listeners: Array<() => void> = []

function emitChange() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

// Cliente: tema guardado o preferencia del sistema
// (strings = primitivos → Object.is compara por valor → no necesita cache)
function getSnapshot(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

// SSR/hydración: light (coincide con el HTML del servidor)
function getServerSnapshot(): Theme {
  return "light"
}

function writeTheme(t: Theme) {
  localStorage.setItem(STORAGE_KEY, t)
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

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
})

// ═════════════════════════════════════════════════════════════
// 3. PROVIDER
// ═════════════════════════════════════════════════════════════

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Efecto que ESCRIBE al DOM — sincronizar sistema externo ✅ (no llama setState)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    // Toggle síncrono: feedback instantáneo sin esperar al re-render
    document.documentElement.classList.toggle("dark", t === "dark")
    writeTheme(t)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// ═════════════════════════════════════════════════════════════
// 4. HOOK
// ═════════════════════════════════════════════════════════════

export function useTheme() {
  return useContext(ThemeContext)
}
