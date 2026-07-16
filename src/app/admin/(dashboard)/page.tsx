"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAdminAuth } from "@/components/admin/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { StatsCard } from "@/components/admin/stats-card"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, Clock } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

const statusColors: Record<string, string> = {
  pending: "#c7c2ba",
  confirmed: "#c9a227",
  tailoring: "#0a0a0a",
  "quality-check": "#d4af37",
  shipped: "#0f5132",
  delivered: "#0f5132",
  cancelled: "#5a1a1a",
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface DashboardData {
  totalRevenue: number
  totalOrders: number
  activeProducts: number
  totalCustomers: number
  lowStockItems: number
  pendingOrders: number
  monthlyRevenue: { month: string; revenue: number; orders: number }[]
  ordersByStatus: { status: string; count: number }[]
  recentOrders: Record<string, unknown>[]
}

export default function AdminDashboard() {
  const { isAdmin } = useAdminAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const thisYear = new Date().getFullYear()
      const startOfYear = `${thisYear}-01-01T00:00:00Z`
      const endOfYear = `${thisYear}-12-31T23:59:59Z`

      const [
        ordersCount,
        pendingCount,
        customersCount,
        productsCount,
        lowStockRes,
        yearOrdersRes,
        statusOrders,
        recentOrdersRes,
      ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).neq("in_stock", false),
        supabase.from("products").select("stock_qty, low_stock_threshold"),
        supabase.from("orders").select("total, status, created_at").gte("created_at", startOfYear).lte("created_at", endOfYear),
        supabase.from("orders").select("status", { count: "exact", head: false }),
        supabase.from("orders").select("order_number, customer_id, total, status, created_at").order("created_at", { ascending: false }).limit(5),
      ])

      const allOrders = (yearOrdersRes.data as Record<string, unknown>[]) || []
      const revenueOrders = allOrders.filter((o) => (o.status as string) !== "cancelled")

      const monthMap = new Map<string, { revenue: number; orders: number }>()
      MONTHS.forEach((m) => monthMap.set(m, { revenue: 0, orders: 0 }))
      for (const o of revenueOrders) {
        const dateStr = String(o.created_at || "")
        if (!dateStr) continue
        try {
          const date = new Date(dateStr)
          const month = MONTHS[date.getMonth()]
          const existing = monthMap.get(month) || { revenue: 0, orders: 0 }
          existing.revenue += Number(o.total || 0)
          existing.orders += 1
          monthMap.set(month, existing)
        } catch {}
      }

      const allStatuses = (statusOrders.data as Record<string, unknown>[]) || []
      const statusCounts: Record<string, number> = {}
      for (const o of allStatuses) {
        const s = (o.status as string) || "pending"
        statusCounts[s] = (statusCounts[s] || 0) + 1
      }
      const ordersByStatus = ["pending", "confirmed", "tailoring", "quality-check", "shipped", "delivered", "cancelled"]
        .map((status) => ({ status, count: statusCounts[status] || 0 }))

      const lowStockProducts = ((lowStockRes.data as { stock_qty: number; low_stock_threshold: number }[]) || [])
        .filter((p) => Number(p.stock_qty) <= Number(p.low_stock_threshold || 5))

    setData({
      totalRevenue: revenueOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
      totalOrders: ordersCount.count || 0,
      activeProducts: productsCount.count || 0,
      totalCustomers: customersCount.count || 0,
      lowStockItems: lowStockProducts.length,
      pendingOrders: pendingCount.count || 0,
      monthlyRevenue: MONTHS.map((month) => ({
        month,
        revenue: monthMap.get(month)?.revenue || 0,
        orders: monthMap.get(month)?.orders || 0,
      })),
      ordersByStatus,
      recentOrders: (recentOrdersRes.data as Record<string, unknown>[]) || [],
    })
    setLoading(false)
  }
  load()
  }, [])

  if (loading || !data) {
    return (
      <div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl text-jet">Dashboard</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Your YSI atelier at a glance</p>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-cream border border-jet/5 p-5 space-y-3">
              <div className="h-3 w-16 bg-jet/5 animate-pulse" />
              <div className="h-7 w-24 bg-jet/5 animate-pulse" />
              <div className="h-3 w-12 bg-jet/5 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mb-8"><div className="h-10 w-64 bg-jet/5 animate-pulse" /></div>
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-cream border border-jet/5 p-6">
              <div className="h-3 w-32 bg-jet/5 animate-pulse mb-6" />
              <div className="h-64 bg-jet/5 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-cream border border-jet/5 p-6">
          <div className="h-3 w-24 bg-jet/5 animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-jet/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl lg:text-4xl text-jet">Dashboard</h1>
        <p className="text-jet/50 text-sm font-poppins mt-1">Your YSI atelier at a glance</p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        <StatsCard label="Total Revenue" value={formatPrice(data.totalRevenue)} change={0} icon={<DollarSign size={18} />} />
        <StatsCard label="Total Orders" value={data.totalOrders} change={0} icon={<ShoppingBag size={18} />} />
        <StatsCard label="Active Products" value={data.activeProducts} change={0} icon={<Package size={18} />} />
        <StatsCard label="Customers" value={data.totalCustomers} change={0} icon={<Users size={18} />} />
      </motion.div>

      <div className="flex flex-wrap gap-3 mb-8">
        {data.lowStockItems > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-burgundy/5 border border-burgundy/15 text-burgundy text-xs font-poppins">
            <AlertTriangle size={14} />
            {data.lowStockItems} products low in stock
          </div>
        )}
        {data.pendingOrders > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gold/5 border border-gold/15 text-gold text-xs font-poppins">
            <Clock size={14} />
            {data.pendingOrders} pending {data.pendingOrders === 1 ? "order" : "orders"}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-cream border border-jet/5 p-6">
          <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-6">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,10,10,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(10,10,10,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(10,10,10,0.4)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(10,10,10,0.08)", borderRadius: 0, fontSize: 12 }} formatter={(value: number) => [formatPrice(value), "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#c9a227" strokeWidth={2} dot={{ fill: "#c9a227", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-cream border border-jet/5 p-6">
          <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-6">Orders by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,10,10,0.04)" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: "rgba(10,10,10,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(10,10,10,0.4)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(10,10,10,0.08)", borderRadius: 0, fontSize: 12 }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {data.ordersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={statusColors[entry.status] || "#c7c2ba"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-cream border border-jet/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-jet/5 flex items-center justify-between">
          <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Recent Orders</h3>
          <a href="/admin/orders" className="text-[10px] font-poppins uppercase tracking-luxe text-gold hover:text-gold-light transition-colors">View All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-jet/5">
                <th className="px-6 py-3 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">Order</th>
                <th className="px-6 py-3 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">Customer</th>
                <th className="px-6 py-3 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">Total</th>
                <th className="px-6 py-3 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">Status</th>
                <th className="px-6 py-3 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o: Record<string, unknown>) => (
                <tr key={o.id as string} className="border-b border-jet/5">
                  <td className="px-6 py-3 text-sm font-poppins text-jet">{(o.order_number || o.orderNumber || o.id) as string}</td>
                  <td className="px-6 py-3 text-sm font-poppins text-jet/70">{((o.customer as Record<string, unknown>)?.name || (o.shipping_address as Record<string, unknown>)?.full_name || "Unknown") as string}</td>
                  <td className="px-6 py-3 text-sm font-poppins text-jet">{formatPrice(Number(o.total))}</td>
                  <td className="px-6 py-3"><StatusBadge status={String(o.status || "pending")} /></td>
                  <td className="px-6 py-3 text-sm font-poppins text-jet/50">{new Date(String(o.created_at || o.createdAt || "")).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm font-poppins text-jet/30">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-stone/10 text-stone border-stone/20" },
    confirmed: { label: "Confirmed", className: "bg-gold/10 text-gold border-gold/20" },
    tailoring: { label: "Tailoring", className: "bg-jet/5 text-jet border-jet/10" },
    "quality-check": { label: "Quality Check", className: "bg-gold/10 text-gold border-gold/20" },
    shipped: { label: "Shipped", className: "bg-emerald/10 text-emerald border-emerald/20" },
    delivered: { label: "Delivered", className: "bg-emerald/10 text-emerald border-emerald/20" },
    cancelled: { label: "Cancelled", className: "bg-burgundy/10 text-burgundy border-burgundy/20" },
  }
  const m = map[status] || map.pending
  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] font-poppins uppercase tracking-luxe border ${m.className}`}>
      {m.label}
    </span>
  )
}
