"use client"

import { useState } from "react"
import { CheckCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FulfillPreOrdersProps {
  productId: string
  productName: string
}

export function FulfillPreOrders({ productId, productName }: FulfillPreOrdersProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [msg, setMsg] = useState("")

  const handleFulfill = async () => {
    setState("loading")
    try {
      const res = await fetch("/api/admin/pre-orders/fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (res.ok) {
        setState("done")
        setMsg(data.fulfilled > 0 ? `${data.fulfilled} pre-order${data.fulfilled > 1 ? "s" : ""} fulfilled for ${data.product}` : "No pending pre-orders found")
      } else {
        setState("error")
        setMsg(data.error || "Failed to fulfill")
      }
    } catch {
      setState("error")
      setMsg("Network error")
    }
  }

  return (
    <div>
      <button onClick={handleFulfill} disabled={state === "loading" || state === "done"}
        className="flex items-center gap-2 px-5 py-2.5 bg-gold text-ivory text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
        {state === "loading" && <Loader2 size={12} className="animate-spin" />}
        {state === "done" && <CheckCircle size={12} />}
        {state === "loading" ? "Fulfilling..." : state === "done" ? "Fulfilled" : "Fulfill Pre-Orders"}
      </button>
      <AnimatePresence>
        {msg && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className={`text-[10px] font-poppins mt-2 ${state === "error" ? "text-red-500" : "text-emerald"}`}>
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
