"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, Package, LogOut, Loader2, ChevronRight, Clock } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface OrderItem {
  name: string; quantity: number; price: number; size?: string; color?: string
}

interface Order {
  id: string; order_number: string; status: string; total: number
  created_at: string; items: OrderItem[]; payment_status: string
}

const statusLabels: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", tailoring: "In Tailoring",
  "quality-check": "Quality Check", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
}

async function fetchCustomerOrders(customerId: string): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data as Record<string, unknown>[]) || []
  } catch {
    return []
  }
}

export default function AccountPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user?.id) {
      fetchCustomerOrders(user.id).then((data) => {
        setOrders(data.map((o) => {
          const items = ((o.order_items as Record<string, unknown>[]) || [])
          return {
            id: o.id as string,
            order_number: o.order_number as string || o.id as string,
            status: (o.status as string) || "pending",
            total: Number(o.total || 0),
            created_at: (o.created_at as string) || new Date().toISOString(),
            items: items.map((i) => ({
              name: (i.name || "") as string,
              quantity: Number(i.quantity || 1),
              price: Number(i.price || 0),
              size: i.size as string | undefined,
              color: i.color as string | undefined,
            })),
            payment_status: (o.payment_status || "pending") as string,
          }
        }))
        setOrdersLoading(false)
      })
    } else if (!loading) {
      setOrdersLoading(false)
    }
  }, [user, loading])

  if (loading || !isAuthenticated) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    toast({ title: "Signed out", variant: "info" })
    router.push("/")
  }

  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ivory border border-jet/5 flex items-center justify-center">
              <User size={20} className="text-jet/40" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-jet">My Account</h1>
              <p className="text-jet/50 text-sm font-poppins">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 h-10 px-4 border border-jet/10 text-xs font-poppins text-jet/50 hover:text-burgundy hover:border-burgundy/30 transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border border-jet/5 bg-ivory p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package size={16} className="text-jet/40" />
                <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Order History</h3>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-gold" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={32} className="mx-auto text-jet/10" />
                  <p className="font-poppins text-sm text-jet/40 mt-3">No orders yet</p>
                  <Link href="/shop" className="inline-flex items-center mt-4 h-9 px-5 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-jet/5 bg-cream p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-poppins text-sm font-medium text-jet">{order.order_number}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={10} className="text-jet/30" />
                            <span className="text-[10px] font-poppins text-jet/40">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-poppins text-sm font-medium text-jet">{formatPrice(order.total)}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-poppins uppercase tracking-luxe ${
                            order.status === "delivered" ? "bg-emerald/10 text-emerald" : order.status === "cancelled" ? "bg-burgundy/10 text-burgundy" : "bg-gold/10 text-gold"
                          }`}>{statusLabels[order.status] || order.status}</span>
                        </div>
                      </div>
                      <div className="border-t border-jet/5 pt-3 space-y-1">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs font-poppins">
                            <span className="text-jet/70">{item.name} {item.size && `(${item.size})`} x{item.quantity}</span>
                            <span className="text-jet/50">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="border border-jet/5 bg-ivory p-6 space-y-6">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Account Details</h3>
              <div>
                <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/30 mb-1">Email</p>
                <p className="font-poppins text-sm text-jet">{user?.email}</p>
              </div>
              <div className="gold-divider" />
              <Link href="/shop" className="flex items-center justify-between h-10 px-3 border border-jet/10 text-xs font-poppins text-jet/60 hover:text-jet hover:border-jet/30 transition-all">
                Browse Collections <ChevronRight size={12} />
              </Link>
              <button onClick={handleLogout} className="flex items-center justify-between w-full h-10 px-3 border border-jet/10 text-xs font-poppins text-jet/60 hover:text-burgundy hover:border-burgundy/30 transition-all">
                Sign Out <LogOut size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
