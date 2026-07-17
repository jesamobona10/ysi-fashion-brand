"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { announce } from "@/components/ui/accessible-app"

type ToastVariant = "success" | "error" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextType {
  toast: (t: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const icons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle size={16} />,
  error: <AlertTriangle size={16} />,
  info: <Info size={16} />,
}

const styles: Record<ToastVariant, string> = {
  success: "bg-emerald/10 border-emerald/20 text-emerald",
  error: "bg-burgundy/10 border-burgundy/20 text-burgundy",
  info: "bg-gold/10 border-gold/20 text-gold",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setToasts((prev) => [...prev, { ...t, id }])
      announce(`${t.title}${t.description ? `: ${t.description}` : ""}`, t.variant === "error" ? "assertive" : "polite")
      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 max-w-sm w-full border p-4 shadow-card",
                styles[t.variant]
              )}
            >
              <span className="mt-px shrink-0">{icons[t.variant]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-poppins uppercase tracking-luxe font-medium">{t.title}</p>
                {t.description && (
                  <p className="text-[10px] font-poppins mt-1 opacity-70">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 mt-px opacity-40 hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
