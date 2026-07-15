"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase/client"
import { formatPrice, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Phone, Mail, CreditCard, Truck } from "lucide-react"
import { updateOrderStatus } from "@/actions"

const statusFlow = ["pending", "confirmed", "tailoring", "quality-check", "shipped", "delivered"]

const statusColors: Record<string, string> = {
  pending: "bg-stone text-white",
  confirmed: "bg-gold text-jet",
  tailoring: "bg-jet text-cream",
  "quality-check": "bg-gold text-jet",
  shipped: "bg-emerald text-white",
  delivered: "bg-emerald text-white",
  cancelled: "bg-burgundy text-white",
}

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  size?: string
  color?: string
}

interface TimelineEvent {
  status: string
  date: string
  note?: string
}

interface OrderDetail {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: string
  paymentMethod: string
  paymentStatus: string
  shippingAddress: {
    street: string
    city: string
    state: string
    country: string
    zip: string
  }
  notes?: string
  createdAt: string
  timeline: TimelineEvent[]
}

async function fetchOrderDetail(id: string): Promise<OrderDetail | null> {
  try {
    const orderRes = await supabase.from("orders").select("*").eq("id", id).maybeSingle()
    const order = orderRes.data as Record<string, unknown> | null
    if (!order) return null

    const customerId = order.customer_id as string | null
    const [itemsRes, timelineRes, customerRes] = await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", id),
      supabase.from("order_timeline").select("*").eq("order_id", id).order("created_at", { ascending: true }),
      customerId ? supabase.from("customers").select("name, email, phone").eq("id", customerId).maybeSingle() : Promise.resolve({ data: null }),
    ])

    const items = ((itemsRes.data || []) as Record<string, unknown>[]).map((i) => ({
      productId: String(i.product_id || ""),
      name: String(i.name || ""),
      quantity: Number(i.quantity || 1),
      price: Number(i.price || 0),
      size: i.size ? String(i.size) : undefined,
      color: i.color ? String(i.color) : undefined,
    }))

    const timeline = ((timelineRes.data || []) as Record<string, unknown>[]).map((t) => ({
      status: String(t.status || ""),
      date: String(t.created_at || new Date().toISOString()),
      note: t.note ? String(t.note) : undefined,
    }))

    const customer = (customerRes?.data || {}) as Record<string, unknown>
    const shippingRaw = order.shipping_address as Record<string, unknown> | undefined

    return {
      id: String(order.id || ""),
      orderNumber: String(order.order_number || order.id || ""),
      customer: {
        name: String(customer.name || "Guest"),
        email: String(customer.email || ""),
        phone: String(customer.phone || ""),
      },
      items,
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping || 0),
      total: Number(order.total || 0),
      status: String(order.status || "pending"),
      paymentMethod: String(order.payment_method || "bank-transfer"),
      paymentStatus: String(order.payment_status || "pending"),
      shippingAddress: {
        street: String(shippingRaw?.street || ""),
        city: String(shippingRaw?.city || ""),
        state: String(shippingRaw?.state || ""),
        country: String(shippingRaw?.country || ""),
        zip: String(shippingRaw?.zip || ""),
      },
      notes: order.notes ? String(order.notes) : undefined,
      createdAt: String(order.created_at || new Date().toISOString()),
      timeline,
    }
  } catch {
    return null
  }
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    fetchOrderDetail(params.id as string).then((found) => {
      if (found) setOrder(found)
      else setError("Order not found")
      setLoading(false)
    })
  }, [params.id])

  const handleStatusUpdate = useCallback(async (newStatus: string) => {
    if (!order) return
    setUpdating(true)
    const result = await updateOrderStatus(order.id, newStatus)
    if (result.error) {
      setError(result.error)
    } else {
      setOrder((prev) => prev ? { ...prev, status: newStatus, timeline: [...prev.timeline, { status: newStatus, date: new Date().toISOString() }] } : prev)
    }
    setUpdating(false)
  }, [order])

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-9 h-9 rounded-lg bg-jet/5 animate-pulse" />
          <div>
            <div className="h-9 w-48 bg-jet/5 animate-pulse" />
            <div className="h-4 w-64 bg-jet/5 animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-cream border border-jet/5 p-6">
                <div className="h-4 w-24 bg-jet/5 animate-pulse mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (<div key={j} className="h-12 bg-jet/5 animate-pulse" />))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-cream border border-jet/5 p-6">
                <div className="h-4 w-20 bg-jet/5 animate-pulse mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (<div key={j} className="h-4 bg-jet/5 animate-pulse" />))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-3xl text-jet/30">{error || "Order not found"}</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/orders")}>Back to Orders</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/admin/orders")} className="w-9 h-9 rounded-lg border border-jet/10 flex items-center justify-center text-jet/40 hover:text-jet transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-display text-3xl text-jet">{order.orderNumber}</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <span className={cn("ml-auto px-4 py-2 text-[10px] font-poppins uppercase tracking-luxe", statusColors[order.status])}>
          {order.status.replace("-", " ")}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Order Items">
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-ivory/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins text-sm text-jet font-medium">{item.name}</p>
                    <p className="text-jet/40 text-xs mt-0.5">Qty: {item.quantity} &middot; {formatPrice(item.price)} each{item.size && ` &middot; Size: ${item.size}`}{item.color && ` &middot; ${item.color}`}</p>
                  </div>
                  <p className="font-poppins text-sm text-jet font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-jet/5 pt-4 mt-4 space-y-1 text-right">
              <div className="flex justify-between text-sm font-poppins text-jet/60"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm font-poppins text-jet/60"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between text-base font-poppins font-medium text-jet pt-2 border-t border-jet/5"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </Section>

          <Section title="Order Timeline">
            <div className="relative">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                  <div className="flex flex-col items-center">
                    <div className={cn("w-3 h-3 rounded-full border-2 shrink-0 mt-1", i === order.timeline.length - 1 ? "bg-gold border-gold" : "bg-cream border-jet/20")} />
                    {i < order.timeline.length - 1 && <div className="w-px flex-1 bg-jet/10 mt-1" />}
                  </div>
                  <div>
                    <p className="font-poppins text-sm text-jet font-medium capitalize">{event.status.replace("-", " ")}</p>
                    <p className="text-jet/40 text-xs mt-0.5">{new Date(event.date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
                    {event.note && <p className="text-jet/60 text-xs mt-1 italic">&ldquo;{event.note}&rdquo;</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Update Status">
            <div className="flex flex-wrap gap-2">
              {statusFlow.map((status) => {
                const currentIdx = statusFlow.indexOf(order.status)
                const targetIdx = statusFlow.indexOf(status)
                const isPast = targetIdx <= currentIdx && order.status !== "cancelled"
                const isCurrent = status === order.status
                return (
                  <button key={status} disabled={isPast && !isCurrent || updating} onClick={() => handleStatusUpdate(status)}
                    className={cn("px-4 py-2 text-[10px] font-poppins uppercase tracking-luxe border transition-all",
                      isCurrent ? "bg-jet text-cream border-jet" : isPast ? "bg-emerald/10 text-emerald border-emerald/20 cursor-not-allowed opacity-60" : "border-jet/10 text-jet/40 hover:border-jet/30")}>
                    {status.replace("-", " ")}
                  </button>
                )
              })}
              {order.status !== "cancelled" && (
                <button disabled={updating} onClick={() => handleStatusUpdate("cancelled")}
                  className="px-4 py-2 text-[10px] font-poppins uppercase tracking-luxe border border-burgundy/20 text-burgundy hover:bg-burgundy/5 transition-all">
                  Cancel Order
                </button>
              )}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Customer">
            <div className="space-y-3 text-sm font-poppins">
              <p className="text-jet font-medium">{order.customer.name}</p>
              <div className="flex items-center gap-2 text-jet/60"><Mail size={13} /> {order.customer.email}</div>
              <div className="flex items-center gap-2 text-jet/60"><Phone size={13} /> {order.customer.phone}</div>
            </div>
          </Section>

          <Section title="Shipping Address">
            <div className="space-y-1 text-sm font-poppins text-jet/70">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="mt-0.5 shrink-0 text-jet/30" />
                <div>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.country} {order.shippingAddress.zip}</p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Payment">
            <div className="space-y-2 text-sm font-poppins">
              <div className="flex items-center gap-2 text-jet/70"><CreditCard size={13} className="text-jet/30" /><span className="capitalize">{order.paymentMethod.replace("-", " ")}</span></div>
              <div className="flex items-center gap-2 text-jet/70"><Truck size={13} className="text-jet/30" /><span>{order.shipping === 0 ? "Free Shipping" : formatPrice(order.shipping)}</span></div>
              <span className={cn("inline-block px-2 py-1 text-[10px] uppercase tracking-luxe",
                order.paymentStatus === "paid" ? "text-emerald bg-emerald/10" : order.paymentStatus === "refunded" ? "text-burgundy bg-burgundy/10" : "text-stone bg-stone/10")}>
                {order.paymentStatus}
              </span>
            </div>
          </Section>

          {order.notes && (
            <Section title="Notes">
              <p className="text-sm font-poppins text-jet/70 italic bg-ivory p-4">&ldquo;{order.notes}&rdquo;</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cream border border-jet/5 p-6">
      <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-4">{title}</h3>
      {children}
    </div>
  )
}
