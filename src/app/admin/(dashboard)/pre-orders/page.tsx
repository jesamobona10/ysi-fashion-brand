"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Package, DollarSign, Calendar, TrendingUp, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface UpcomingRelease {
  id: string
  name: string
  slug: string
  price: number
  image: string
  releaseDate: string
}

export default function PreOrderDashboard() {
  const [data, setData] = useState<{
    pendingCount: number
    revenue: number
    upcomingReleases: UpcomingRelease[]
    fulfillmentRate: number
    deliveredCount: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/reports/pre-orders")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-jet/30" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-jet/50 text-sm font-poppins">Failed to load pre-order data</p>
  }

  const cards = [
    { label: "Pending Pre-Orders", value: data.pendingCount, icon: Package, color: "bg-gold/10 text-gold" },
    { label: "Pre-Order Revenue", value: formatPrice(data.revenue), icon: DollarSign, color: "bg-emerald/10 text-emerald" },
    { label: "Fulfillment Rate", value: `${data.fulfillmentRate}%`, icon: TrendingUp, color: "bg-jet/5 text-jet" },
    { label: "Fulfilled Orders", value: data.deliveredCount, icon: Package, color: "bg-gold/10 text-gold" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-jet">Pre-Orders</h1>
        <p className="text-jet/50 text-sm font-poppins mt-1">Overview of pre-order activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-jet/5 bg-ivory p-5">
            <div className={`w-9 h-9 rounded-full ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={16} />
            </div>
            <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/40">{card.label}</p>
            <p className="font-display text-2xl text-jet mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-4">Upcoming Releases</h2>
        {data.upcomingReleases.length === 0 ? (
          <p className="text-jet/30 text-xs font-poppins">No upcoming pre-order releases</p>
        ) : (
          <div className="space-y-2">
            {data.upcomingReleases.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 border border-jet/5 bg-ivory">
                <div className="w-12 h-16 overflow-hidden bg-cream shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-jet/10"><Package size={20} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/products/${product.id}`} className="font-poppins text-sm text-jet font-medium hover:text-gold transition-colors">{product.name}</Link>
                  <p className="text-[10px] font-poppins text-jet/40 mt-0.5">{formatPrice(product.price)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-poppins text-gold font-medium">
                    {new Date(product.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-[9px] font-poppins text-jet/30">
                    {Math.ceil((new Date(product.releaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
