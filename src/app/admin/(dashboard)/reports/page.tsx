"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { Loader2, RefreshCw, TrendingUp, ShoppingCart, Package, AlertTriangle } from "lucide-react"

interface MonthlyRevenue {
  month: string
  revenue: number
}

interface AbandonedCart {
  email: string | null
  items: unknown[]
  hours_abandoned: string
}

export default function AdminReportsPage() {
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [revenueRes, cartsRes, lowStockRes, ordersRes] = await Promise.all([
        fetch("/api/reports/revenue"),
        fetch("/api/reports/abandoned-carts"),
        supabase.from("low_stock_products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
      ])

      const revenueData = await revenueRes.json()
      if (revenueData.monthly) {
        setRevenue(revenueData.monthly)
        setTotalRevenue(revenueData.total || 0)
      }

      const cartsData = await cartsRes.json()
      if (cartsData.carts) setAbandonedCarts(cartsData.carts)

      setLowStockCount(lowStockRes.count || 0)
      setTotalOrders(ordersRes.count || 0)
    } catch {} finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-playfair text-jet">Reports</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Revenue, abandoned carts & performance</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-1.5 h-9 px-4 border border-jet/10 text-xs font-poppins text-jet/60 hover:text-jet transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-cream border border-jet/10 p-5">
          <div className="flex items-center gap-2 text-emerald mb-2"><TrendingUp size={16} /><span className="text-[10px] font-poppins uppercase tracking-luxe">Total Revenue</span></div>
          <p className="font-playfair text-2xl text-jet">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-cream border border-jet/10 p-5">
          <div className="flex items-center gap-2 text-jet/50 mb-2"><ShoppingCart size={16} /><span className="text-[10px] font-poppins uppercase tracking-luxe">Delivered Orders</span></div>
          <p className="font-playfair text-2xl text-jet">{totalOrders}</p>
        </div>
        <div className="bg-cream border border-jet/10 p-5">
          <div className="flex items-center gap-2 text-amber mb-2"><AlertTriangle size={16} /><span className="text-[10px] font-poppins uppercase tracking-luxe">Low Stock Items</span></div>
          <p className="font-playfair text-2xl text-jet">{lowStockCount}</p>
        </div>
        <div className="bg-cream border border-jet/10 p-5">
          <div className="flex items-center gap-2 text-burgundy mb-2"><Package size={16} /><span className="text-[10px] font-poppins uppercase tracking-luxe">Abandoned Carts</span></div>
          <p className="font-playfair text-2xl text-jet">{abandonedCarts.length}</p>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-cream border border-jet/10 p-6">
          <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-4">Monthly Revenue</h3>
          <div className="space-y-2">
            {revenue.length === 0 ? (
              <p className="text-jet/30 text-sm font-poppins text-center py-8">No revenue data yet</p>
            ) : (
              revenue.map((r) => {
                const [year, month] = r.month.split("-")
                const maxRevenue = Math.max(...revenue.map((x) => x.revenue), 1)
                const pct = (r.revenue / maxRevenue) * 100
                return (
                  <div key={r.month} className="flex items-center gap-3">
                    <span className="text-[10px] font-poppins text-jet/40 w-16 shrink-0">
                      {new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                    </span>
                    <div className="flex-1 h-5 bg-jet/5">
                      <div className="h-full bg-gold/60 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-poppins text-jet font-medium w-24 text-right">{formatPrice(r.revenue)}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Abandoned Carts */}
        <div className="bg-cream border border-jet/10 p-6">
          <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-4">Abandoned Carts</h3>
          {abandonedCarts.length === 0 ? (
            <p className="text-jet/30 text-sm font-poppins text-center py-8">No abandoned carts</p>
          ) : (
            <div className="space-y-3">
              {abandonedCarts.slice(0, 8).map((cart, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-poppins text-sm text-jet">{cart.email || "Guest"}</p>
                    <p className="text-[10px] font-poppins text-jet/40">{Array.isArray(cart.items) ? cart.items.length : 0} items</p>
                  </div>
                  <span className="text-[10px] font-poppins text-burgundy">
                    {Math.round(parseFloat(String(cart.hours_abandoned).replace("hours", "").trim()) || 0)}h ago
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
