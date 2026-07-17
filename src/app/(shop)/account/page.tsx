"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  User, Package, LogOut, Loader2, ChevronRight, Clock, Camera,
  AlertTriangle, Trash2, Heart,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

interface OrderItem {
  name: string; quantity: number; price: number; size?: string; color?: string
}

interface Order {
  id: string; order_number: string; status: string; total: number
  created_at: string; items: OrderItem[]; payment_status: string
  order_type?: string; pre_order_release_date?: string
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

async function fetchCustomerProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("name, phone, avatar_url")
      .eq("id", userId)
      .maybeSingle()
    if (error) throw error
    return data as { name?: string; phone?: string; avatar_url?: string } | null
  } catch {
    return null
  }
}

export default function AccountPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [showDeactivate, setShowDeactivate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [wishlistCount, setWishlistCount] = useState(0)
  const [recentlyViewed, setRecentlyViewed] = useState(0)

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
            order_type: (o.order_type as string) || "standard",
            pre_order_release_date: (o.pre_order_release_date as string) || undefined,
          }
        }))
        setOrdersLoading(false)
      })

      fetchCustomerProfile(user.id).then((profile) => {
        if (profile) {
          setName(profile.name || "")
          setPhone(profile.phone || "")
          setAvatarUrl(profile.avatar_url || "")
        }
      })

      supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => setWishlistCount(count || 0))

      supabase.from("recently_viewed").select("id", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => setRecentlyViewed(count || 0))
    } else if (!loading) {
      setOrdersLoading(false)
    }
  }, [user, loading])

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    const { error } = await supabase
      .from("customers")
      .update({ name: name.trim(), phone: phone.trim() || null })
      .eq("id", user.id)
    setSaving(false)
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "error" })
      return
    }
    toast({ title: "Profile updated", variant: "success" })
    setEditing(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const filePath = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl
      setAvatarUrl(publicUrl)
      await supabase.from("customers").update({ avatar_url: publicUrl }).eq("id", user.id)
      toast({ title: "Photo updated", variant: "success" })
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "error" })
    } finally {
      setUploading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!user?.id) return
    setDeactivating(true)
    const { error } = await supabase
      .from("customers")
      .update({ status: "inactive" })
      .eq("id", user.id)
    setDeactivating(false)
    if (error) {
      toast({ title: "Failed to deactivate", description: error.message, variant: "error" })
      return
    }
    toast({ title: "Account deactivated", description: "You can contact support to reactivate.", variant: "info" })
    await logout()
    router.push("/")
  }

  const handleDelete = async () => {
    if (!user?.id) return
    setDeleting(true)
    try {
      const res = await fetch("/api/account/delete", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete account")
      await logout()
      toast({ title: "Account deleted", variant: "info" })
      router.push("/")
    } catch (err) {
      toast({ title: "Failed to delete", description: err instanceof Error ? err.message : String(err), variant: "error" })
      setDeleting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast({ title: "Signed out", variant: "info" })
    router.push("/")
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full bg-ivory border border-jet/5 overflow-hidden group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={24} className="text-jet/40" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-jet/0 group-hover:bg-jet/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                {uploading ? <Loader2 size={14} className="animate-spin text-cream" /> : <Camera size={14} className="text-cream" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
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
          {/* Orders */}
          <div className="lg:col-span-2 space-y-6">
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
                        <div className="flex items-center gap-2">
                          {order.order_type === "pre_order" && (
                            <span className="px-1.5 py-0.5 bg-gold/10 text-gold text-[9px] font-poppins uppercase tracking-luxe">Pre</span>
                          )}
                          <p className="font-poppins text-sm font-medium text-jet">{order.order_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-poppins text-sm font-medium text-jet">{formatPrice(order.total)}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-poppins uppercase tracking-luxe ${order.status === "delivered" ? "bg-emerald/10 text-emerald" : order.status === "cancelled" ? "bg-burgundy/10 text-burgundy" : "bg-gold/10 text-gold"}`}>{statusLabels[order.status] || order.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-jet/30" />
                        <span className="text-[10px] font-poppins text-jet/40">{new Date(order.created_at).toLocaleDateString()}</span>
                        {order.order_type === "pre_order" && order.pre_order_release_date && (
                          <span className="text-[9px] font-poppins text-gold/70">
                            · Releases {new Date(order.pre_order_release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {new Date(order.pre_order_release_date) > new Date() && ` (${Math.ceil((new Date(order.pre_order_release_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d)`}
                          </span>
                        )}
                      </div>
                      <div className="border-t border-jet/5 pt-3 mt-2 space-y-1">
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

            {/* Recently Viewed */}
            {recentlyViewed > 0 && (
              <div className="border border-jet/5 bg-ivory p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={16} className="text-jet/40" />
                  <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Recently Viewed</h3>
                </div>
                <p className="text-jet/50 text-xs font-poppins">{recentlyViewed} products</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile */}
            <div className="border border-jet/5 bg-ivory p-6 space-y-5">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Profile</h3>
              {editing ? (
                <>
                  <div>
                    <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/30 mb-1">Name</p>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 bg-cream border border-jet/10 text-sm font-poppins text-jet focus:outline-none focus:border-gold/50" />
                  </div>
                  <div>
                    <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/30 mb-1">Phone</p>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3 bg-cream border border-jet/10 text-sm font-poppins text-jet focus:outline-none focus:border-gold/50" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="gold" size="sm" onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/30 mb-1">Name</p>
                    <p className="font-poppins text-sm text-jet">{name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/30 mb-1">Phone</p>
                    <p className="font-poppins text-sm text-jet">{phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/30 mb-1">Email</p>
                    <p className="font-poppins text-sm text-jet">{user?.email}</p>
                  </div>
                  <div className="gold-divider" />
                  <button onClick={() => setEditing(true)}
                    className="w-full h-9 border border-jet/10 text-xs font-poppins text-jet/60 hover:text-jet hover:border-jet/30 transition-all">
                    Edit Profile
                  </button>
                </>
              )}
            </div>

            {/* Quick Links */}
            <div className="border border-jet/5 bg-ivory p-6 space-y-3">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Quick Links</h3>
              <Link href="/wishlist" className="flex items-center justify-between h-9 px-3 border border-jet/10 text-xs font-poppins text-jet/60 hover:text-jet hover:border-jet/30 transition-all">
                Wishlist {wishlistCount > 0 && <span className="text-gold text-[10px]">({wishlistCount})</span>} <ChevronRight size={12} />
              </Link>
              <Link href="/shop" className="flex items-center justify-between h-9 px-3 border border-jet/10 text-xs font-poppins text-jet/60 hover:text-jet hover:border-jet/30 transition-all">
                Browse Collections <ChevronRight size={12} />
              </Link>
              <button onClick={handleLogout} className="flex items-center justify-between w-full h-9 px-3 border border-jet/10 text-xs font-poppins text-jet/60 hover:text-burgundy hover:border-burgundy/30 transition-all">
                Sign Out <LogOut size={12} />
              </button>
            </div>

            {/* Danger Zone */}
            <div className="border border-burgundy/10 bg-burgundy/[0.02] p-6 space-y-3">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-burgundy/60">Account</h3>
              {showDeactivate ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-poppins text-jet/60">This will temporarily disable your account. You can contact us to reactivate.</p>
                  <div className="flex gap-2">
                    <button onClick={handleDeactivate} disabled={deactivating}
                      className="flex-1 h-8 bg-burgundy/10 border border-burgundy/20 text-burgundy text-[10px] font-poppins uppercase tracking-luxe hover:bg-burgundy hover:text-cream transition-all">
                      {deactivating ? <Loader2 size={10} className="animate-spin mx-auto" /> : "Confirm Deactivate"}
                    </button>
                    <button onClick={() => setShowDeactivate(false)} className="h-8 px-3 border border-jet/10 text-[10px] font-poppins text-jet/40 hover:text-jet transition-all">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowDeactivate(true)}
                  className="w-full h-9 border border-burgundy/20 text-xs font-poppins text-burgundy/60 hover:bg-burgundy hover:text-cream hover:border-burgundy transition-all">
                  Deactivate Account
                </button>
              )}
              {showDelete ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-burgundy/5 p-2">
                    <AlertTriangle size={12} className="text-burgundy shrink-0 mt-0.5" />
                    <p className="text-[10px] font-poppins text-burgundy/70">This permanently deletes your account and all data. This cannot be undone.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleDelete} disabled={deleting}
                      className="flex-1 h-8 bg-burgundy text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-burgundy/80 transition-all">
                      {deleting ? <Loader2 size={10} className="animate-spin mx-auto" /> : "Permanently Delete"}
                    </button>
                    <button onClick={() => setShowDelete(false)} className="h-8 px-3 border border-jet/10 text-[10px] font-poppins text-jet/40 hover:text-jet transition-all">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowDelete(true)}
                  className="w-full h-9 border border-burgundy/20 text-xs font-poppins text-burgundy/60 hover:bg-burgundy hover:text-cream hover:border-burgundy transition-all">
                  Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
