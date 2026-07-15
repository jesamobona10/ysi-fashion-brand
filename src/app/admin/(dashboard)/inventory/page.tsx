"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, CheckCircle, RefreshCw, Plus, Minus } from "lucide-react"
import { restockProduct } from "@/actions"
import { useToast } from "@/components/ui/toast"

interface InventoryItem {
  id: string
  name: string
  fabric: string
  images: string[]
  current: number
  lowStockThreshold: number
  lastRestocked: string
}

interface InventoryLogEntry {
  id: string
  productId: string
  type: string
  quantity: number
  previousStock: number
  newStock: number
  date: string
  note: string
  performedBy: string
}

async function fetchProducts(): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return (data as Record<string, unknown>[]) || []
  } catch {
    return []
  }
}

async function fetchInventoryLogs(productId: string): Promise<InventoryLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from("inventory_logs")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return ((data || []) as Record<string, unknown>[]).map((log) => ({
      id: String(log.id || ""),
      productId: String(log.product_id || ""),
      type: String(log.type || ""),
      quantity: Number(log.quantity || 0),
      previousStock: Number(log.previous_stock || 0),
      newStock: Number(log.new_stock || 0),
      date: String(log.created_at || new Date().toISOString()),
      note: String(log.note || ""),
      performedBy: String(log.performed_by || ""),
    }))
  } catch {
    return []
  }
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [logs, setLogs] = useState<InventoryLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [restockInput, setRestockInput] = useState<Record<string, number>>({})
  const [showLog, setShowLog] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts().then((productsData) => {
      const mapped: InventoryItem[] = productsData.map((p) => ({
        id: String(p.id),
        name: String(p.name || ""),
        fabric: String(p.fabric || ""),
        images: Array.isArray(p.images) ? p.images as string[] : [],
        current: Number(p.stock_qty ?? 0),
        lowStockThreshold: Number(p.low_stock_threshold ?? 5),
        lastRestocked: String(p.last_restocked ?? ""),
      }))
      setItems(mapped)
      setLoading(false)
    })
  }, [])

  const criticalItems = items.filter((item) => item.current <= item.lowStockThreshold)

  const handleRestock = useCallback(async (productId: string) => {
    const qty = restockInput[productId] || 0
    if (qty <= 0) {
      toast({ title: "Enter a quantity to restock", variant: "info" })
      return
    }

    const result = await restockProduct(productId, qty)
    if (result.error) {
      toast({ title: "Restock failed", description: result.error, variant: "error" })
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, current: result.newStock!, lastRestocked: new Date().toISOString() }
          : item
      )
    )
    const newLog: InventoryLogEntry = {
      id: `log_${Date.now()}`,
      productId,
      type: "restock",
      quantity: qty,
      previousStock: result.previousStock!,
      newStock: result.newStock!,
      date: new Date().toISOString(),
      note: "Manual restock",
      performedBy: "Admin",
    }
    setLogs((prev) => [...prev, newLog])
    setRestockInput((prev) => ({ ...prev, [productId]: 0 }))
    toast({ title: `Restocked +${qty} units`, variant: "success" })
  }, [restockInput, toast])

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-9 w-40 bg-jet/5 animate-pulse" />
          <div className="h-4 w-32 bg-jet/5 animate-pulse mt-2" />
        </div>
        <div className="bg-cream border border-jet/5 p-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-14 bg-jet/5 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-jet/5 animate-pulse" />
                  <div className="h-3 w-24 bg-jet/5 animate-pulse mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-jet">Inventory</h1>
        <p className="text-jet/50 text-sm font-poppins mt-1">{items.length} products tracked</p>
      </div>

      {criticalItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-burgundy/5 border border-burgundy/15">
          <div className="flex items-center gap-2 text-burgundy mb-3">
            <AlertTriangle size={16} />
            <span className="font-poppins text-[10px] uppercase tracking-luxe font-medium">
              {criticalItems.length} {criticalItems.length === 1 ? "product" : "products"} below minimum stock threshold
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {criticalItems.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1.5 bg-burgundy/10 text-burgundy px-3 py-1.5 text-[10px] font-poppins uppercase tracking-luxe">
                <Package size={12} /> {item.name} &mdash; {item.current} left
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="bg-cream border border-jet/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-jet/5">
                <th className="px-6 py-4 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">Product</th>
                <th className="px-6 py-4 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-poppins uppercase tracking-luxe text-jet/40 hidden lg:table-cell">Min. Threshold</th>
                <th className="px-6 py-4 text-[10px] font-poppins uppercase tracking-luxe text-jet/40 hidden lg:table-cell">Last Restocked</th>
                <th className="px-6 py-4 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">Quick Restock</th>
                <th className="px-6 py-4 text-[10px] font-poppins uppercase tracking-luxe text-jet/40"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const status = item.current <= 0 ? "out" : item.current <= item.lowStockThreshold ? "low" : "healthy"
                return (
                  <motion.tr key={item.id} variants={fadeUp} className="border-b border-jet/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.images[0]} alt={item.name} className="w-10 h-14 object-cover rounded" />
                        <div>
                          <p className="font-poppins text-sm text-jet font-medium">{item.name}</p>
                          <p className="text-[10px] text-jet/40">{item.fabric}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("font-poppins text-lg font-medium", status === "out" ? "text-burgundy" : status === "low" ? "text-gold" : "text-emerald")}>
                          {item.current}
                        </span>
                        <StatusDot status={status} />
                      </div>
                      <div className="w-24 h-1.5 bg-jet/5 mt-1 overflow-hidden">
                        <div className={cn("h-full transition-all duration-500", status === "out" ? "bg-burgundy" : status === "low" ? "bg-gold" : "bg-emerald")}
                          style={{ width: `${Math.min(100, (item.current / Math.max(item.lowStockThreshold * 3, 1)) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell"><span className="font-poppins text-sm text-jet/60">{item.lowStockThreshold}</span></td>
                    <td className="px-6 py-4 hidden lg:table-cell"><span className="font-poppins text-sm text-jet/60">{item.lastRestocked || "N/A"}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex border border-jet/10">
                          <button onClick={() => setRestockInput((prev) => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 5) }))}
                            className="w-8 h-8 flex items-center justify-center text-jet/40 hover:text-jet transition-colors"><Minus size={12} /></button>
                          <input type="number" value={restockInput[item.id] || 0}
                            onChange={(e) => setRestockInput((prev) => ({ ...prev, [item.id]: Math.max(0, Number(e.target.value)) }))}
                            className="w-14 h-8 text-center text-sm font-poppins text-jet border-x border-jet/10 bg-transparent focus:outline-none" min={0} />
                          <button onClick={() => setRestockInput((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 5 }))}
                            className="w-8 h-8 flex items-center justify-center text-jet/40 hover:text-jet transition-colors"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => handleRestock(item.id)} disabled={!restockInput[item.id] || restockInput[item.id] <= 0}
                          className="w-8 h-8 flex items-center justify-center text-jet/30 hover:text-emerald disabled:opacity-30 transition-colors" title="Restock">
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={async () => {
                        if (showLog === item.id) { setShowLog(null); return }
                        const logData = await fetchInventoryLogs(item.id)
                        setLogs(logData)
                        setShowLog(item.id)
                      }}
                        className="text-[10px] font-poppins uppercase tracking-luxe text-gold hover:text-gold-light transition-colors">
                        {showLog === item.id ? "Hide" : "History"}
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showLog && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-cream border border-jet/5 p-6">
          <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-4">Inventory History</h3>
          <div className="space-y-3">
            {logs.filter((l) => l.productId === showLog).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-jet/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={cn("w-2 h-2 rounded-full", log.type === "restock" ? "bg-emerald" : log.type === "sale" ? "bg-gold" : log.type === "return" ? "bg-stone" : "bg-burgundy")} />
                  <div>
                    <p className="font-poppins text-sm text-jet capitalize">{log.type}</p>
                    <p className="text-[10px] text-jet/40">{log.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-poppins text-sm font-medium", log.quantity > 0 ? "text-emerald" : "text-burgundy")}>
                    {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                  </p>
                  <p className="text-[10px] text-jet/40">{new Date(log.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function StatusDot({ status }: { status: "healthy" | "low" | "out" }) {
  const colors = { healthy: "bg-emerald", low: "bg-gold", out: "bg-burgundy" }
  return (<span className={cn("w-2 h-2 rounded-full", colors[status])} />)
}
