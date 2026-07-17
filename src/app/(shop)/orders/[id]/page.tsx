"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Package, Check, Truck, X, Clock, AlertTriangle } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/toast"
import { friendlyError } from "@/lib/friendly-error"

interface OrderItem {
  id: string
  product_id: string
  name: string
  quantity: number
  price: number
  size: string | null
  color: string | null
}

interface TimelineEntry {
  id: string
  status: string
  note: string | null
  created_at: string
}

interface Order {
  id: string
  order_number: string
  status: string
  subtotal: number
  shipping: number
  delivery_fee: number
  total: number
  payment_method: string
  payment_status: string
  delivery_method: string
  gift_note: string | null
  notes: string | null
  shipping_address: Record<string, string>
  created_at: string
  order_items: OrderItem[]
  order_timeline: TimelineEntry[]
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "text-amber bg-amber/5 border-amber/20", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Check },
  processing: { label: "Processing", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: Package },
  tailoring: { label: "In Tailoring", color: "text-gold bg-gold/5 border-gold/20", icon: Package },
  "quality-check": { label: "Quality Check", color: "text-emerald bg-emerald/5 border-emerald/20", icon: Check },
  shipped: { label: "Shipped", color: "text-emerald bg-emerald/5 border-emerald/20", icon: Truck },
  delivered: { label: "Delivered", color: "text-emerald bg-emerald/10 border-emerald/30", icon: Check },
  cancelled: { label: "Cancelled", color: "text-burgundy bg-burgundy/5 border-burgundy/20", icon: X },
}

const deliveryMethodLabels: Record<string, string> = {
  standard: "Standard Delivery",
  express: "Express Delivery",
  "next-day": "Next Day Delivery",
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/orders/${params.id}`)
      return
    }
    fetchOrder()
  }, [authLoading, isAuthenticated, params.id])

  async function fetchOrder() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load order")
      setOrder(data.order as Order)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelOrder() {
    if (!confirm("Are you sure you want to cancel this order?")) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${params.id}/cancel`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to cancel order")
      toast({ title: "Order cancelled", variant: "info" })
      fetchOrder()
    } catch (err) {
      toast({ title: "Failed to cancel", description: friendlyError(err), variant: "error" })
    } finally {
      setCancelling(false)
    }
  }

  async function handleReorder() {
    if (!order) return
    try {
      const res = await fetch("/api/cart/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reorder")
      toast({ title: "Items added to cart", variant: "success" })
      router.push("/checkout")
    } catch (err) {
      toast({ title: "Failed to reorder", description: friendlyError(err), variant: "error" })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-burgundy font-poppins text-sm">{error}</p>
          <button onClick={() => router.back()} className="mt-4 text-xs font-poppins text-jet/40 hover:text-jet underline">Go back</button>
        </div>
      </div>
    )
  }

  if (!order) return null

  const statusInfo = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = statusInfo.icon
  const canCancel = ["pending", "confirmed"].includes(order.status)
  const canReorder = ["delivered", "cancelled"].includes(order.status)

  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg border border-jet/10 flex items-center justify-center text-jet/40 hover:text-jet transition-colors"><ArrowLeft size={16} /></button>
          <div>
            <h1 className="font-display text-3xl text-jet">Order Details</h1>
            <p className="text-jet/50 text-sm font-poppins mt-1">Tracking for {order.order_number}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div className={cn("flex items-center gap-3 p-4 border", statusInfo.color)}>
              <StatusIcon size={20} />
              <div>
                <p className="font-poppins text-sm font-medium">{statusInfo.label}</p>
                <p className="text-xs font-poppins opacity-70">Updated {new Date(order.order_timeline?.[order.order_timeline.length - 1]?.created_at || order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-jet/5 bg-ivory p-6">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-6">Order Timeline</h3>
              <div className="space-y-0">
                {[...(order.order_timeline || [])].reverse().map((entry, idx, arr) => {
                  const isLast = idx === arr.length - 1
                  return (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-3 h-3 rounded-full border-2 mt-1", isLast ? "bg-gold border-gold" : "bg-cream border-jet/20")} />
                        {!isLast && <div className="w-px flex-1 bg-jet/10 my-1" />}
                      </div>
                      <div className={cn("pb-6", isLast && "pb-0")}>
                        <p className="font-poppins text-sm text-jet font-medium capitalize">{entry.note || entry.status.replace("-", " ")}</p>
                        <p className="text-[10px] font-poppins text-jet/40 mt-0.5">
                          {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Items */}
            <div className="border border-jet/5 bg-ivory p-6">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-4">Items</h3>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-18 bg-cream border border-jet/5 flex items-center justify-center text-jet/20 text-[10px] font-poppins">img</div>
                    <div className="flex-1">
                      <p className="font-poppins text-sm text-jet">{item.name}</p>
                      <p className="text-xs font-poppins text-jet/40">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span> &bull; </span>}
                        {item.color && <span>{item.color}</span>}
                        <span className="ml-2">Qty: {item.quantity}</span>
                      </p>
                    </div>
                    <p className="font-poppins text-sm text-jet font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Note */}
            {order.gift_note && (
              <div className="border border-jet/5 bg-ivory p-6">
                <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-2">Gift Note</h3>
                <p className="font-poppins text-sm text-jet/70 italic">&ldquo;{order.gift_note}&rdquo;</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Order Info */}
            <div className="border border-jet/5 bg-ivory p-6 space-y-4">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Order Info</h3>
              <div>
                <p className="text-[10px] font-poppins text-jet/30 uppercase tracking-wider">Order Number</p>
                <p className="font-poppins text-sm text-jet font-medium">{order.order_number}</p>
              </div>
              <div>
                <p className="text-[10px] font-poppins text-jet/30 uppercase tracking-wider">Placed On</p>
                <p className="font-poppins text-sm text-jet">{new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-[10px] font-poppins text-jet/30 uppercase tracking-wider">Delivery Method</p>
                <p className="font-poppins text-sm text-jet">{deliveryMethodLabels[order.delivery_method] || order.delivery_method}</p>
              </div>
              <div>
                <p className="text-[10px] font-poppins text-jet/30 uppercase tracking-wider">Payment</p>
                <p className="font-poppins text-sm text-jet capitalize">{order.payment_method.replace("-", " ")}</p>
                <span className={cn("inline-block px-2 py-0.5 text-[10px] font-poppins mt-1", order.payment_status === "paid" ? "text-emerald bg-emerald/5" : "text-amber bg-amber/5")}>
                  {order.payment_status}
                </span>
              </div>

              <div className="gold-divider" />
              <div className="flex justify-between text-sm font-poppins"><span className="text-jet/50">Subtotal</span><span className="text-jet">{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm font-poppins"><span className="text-jet/50">Shipping</span><span className="text-jet">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm font-poppins"><span className="text-jet/50">Delivery Fee</span><span className="text-jet">{formatPrice(order.delivery_fee)}</span></div>
              )}
              <div className="flex justify-between text-sm font-poppins font-medium"><span className="text-jet">Total</span><span className="text-jet">{formatPrice(order.total)}</span></div>
            </div>

            {/* Shipping Address */}
            <div className="border border-jet/5 bg-ivory p-6">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-2">Shipping Address</h3>
              {order.shipping_address && (
                <div className="font-poppins text-sm text-jet/70 space-y-0.5">
                  <p>{order.shipping_address.street}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                  <p>{order.shipping_address.country}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {canCancel && (
                <div>
                  <button onClick={handleCancelOrder} disabled={cancelling}
                    className="w-full h-11 border border-burgundy/20 text-burgundy text-[10px] font-poppins uppercase tracking-luxe hover:bg-burgundy/5 transition-all disabled:opacity-50">
                    {cancelling ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                    Cancel Order
                  </button>
                </div>
              )}
              {canReorder && (
                <button onClick={handleReorder}
                  className="w-full h-11 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all">
                  Reorder
                </button>
              )}
              <Link href="/account" className="block w-full h-11 border border-jet/10 text-jet/60 text-[10px] font-poppins uppercase tracking-luxe flex items-center justify-center hover:bg-jet/5 transition-all">
                Back to Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
