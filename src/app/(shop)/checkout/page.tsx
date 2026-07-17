"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, Trash2, Loader2, AlertTriangle, Check } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { formatPrice } from "@/lib/utils"
import { isValidEmail, isValidPhone, ALLOWED_COUNTRIES, sanitizeString } from "@/lib/validation"
import { friendlyError } from "@/lib/friendly-error"
import { useToast } from "@/components/ui/toast"

const paymentMethods = [
  { value: "cash-on-delivery", label: "Cash on Delivery", desc: "Pay when your order arrives" },
]

const deliveryMethods = [
  { value: "standard", label: "Standard Delivery", desc: "5–7 business days", price: 0 },
  { value: "express", label: "Express Delivery", desc: "2–3 business days", price: 5000 },
  { value: "next-day", label: "Next Day Delivery", desc: "Order before 2PM for next-day", price: 12000 },
]

interface FieldErrors {
  name?: string; email?: string; phone?: string; street?: string; city?: string
  b_street?: string; b_city?: string; b_state?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state, removeItem, updateQty, totalItems, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [contact, setContact] = useState({ name: "", email: "", phone: "" })
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [billing, setBilling] = useState({ street: "", city: "", state: "", country: "Nigeria" })

  useEffect(() => {
    if (isAuthenticated && user?.email && !contact.email) {
      setContact((prev) => ({ ...prev, email: user.email! }))
    }
  }, [isAuthenticated, user, contact.email])

  const [address, setAddress] = useState({ street: "", city: "", state: "", country: "Nigeria" })
  const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery")
  const [deliveryMethod, setDeliveryMethod] = useState("standard")
  const [giftNote, setGiftNote] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  const deliveryFee = deliveryMethods.find((d) => d.value === deliveryMethod)?.price || 0
  const finalTotal = totalPrice + deliveryFee

  useEffect(() => {
    if (sameAsShipping) {
      setBilling({ ...address })
    }
  }, [sameAsShipping, address])

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    let valid = true
    const name = contact.name.trim()
    if (!name) { errors.name = "Full name is required"; valid = false }
    else if (name.length < 2) { errors.name = "Name must be at least 2 characters"; valid = false }
    else if (name.length > 200) { errors.name = "Name is too long"; valid = false }
    const email = contact.email.trim().toLowerCase()
    if (!email) { errors.email = "Email is required"; valid = false }
    else if (!isValidEmail(email)) { errors.email = "Please enter a valid email address"; valid = false }
    const phone = contact.phone.trim()
    if (!phone) { errors.phone = "Phone number is required"; valid = false }
    else if (!isValidPhone(phone)) { errors.phone = "Please enter a valid phone number"; valid = false }
    if (!address.street.trim()) { errors.street = "Street address is required"; valid = false }
    if (!address.city.trim()) { errors.city = "City is required"; valid = false }
    if (!sameAsShipping) {
      if (!billing.street.trim()) { errors.b_street = "Billing street is required"; valid = false }
      if (!billing.city.trim()) { errors.b_city = "Billing city is required"; valid = false }
    }
    setFieldErrors(errors)
    return valid
  }

  const handlePlaceOrder = async () => {
    if (!validate()) return
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            name: contact.name.trim(),
            email: contact.email.trim().toLowerCase(),
            phone: contact.phone.trim(),
          },
          address: {
            street: address.street.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
            country: address.country,
          },
          billingAddress: sameAsShipping ? null : {
            street: billing.street.trim(),
            city: billing.city.trim(),
            state: billing.state.trim(),
            country: billing.country,
          },
          deliveryMethod,
          deliveryFee,
          giftNote: sanitizeString(giftNote, 500),
          paymentMethod,
          notes: sanitizeString(notes, 2000),
          items: state.items.map((item) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
          })),
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to place order")
      }

      clearCart()
      toast({ title: "Order placed!", description: `Your order ${result.orderNumber} has been placed successfully.`, variant: "success" })
      router.push(`/checkout/confirmation?order=${result.orderNumber}`)
    } catch (err) {
      const friendly = friendlyError(err)
      toast({ title: "Unable to complete order", description: friendly, variant: "error" })
      setError(friendly)
    } finally {
      setSubmitting(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-jet/30">Your cart is empty</h1>
          <Link href="/shop" className="mt-4 inline-flex items-center h-10 px-6 border border-jet/10 text-sm font-poppins text-jet/60 hover:bg-jet hover:text-cream transition-all">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg border border-jet/10 flex items-center justify-center text-jet/40 hover:text-jet transition-colors"><ArrowLeft size={16} /></button>
          <div>
            <h1 className="font-display text-3xl text-jet">Checkout</h1>
            <p className="text-jet/50 text-sm font-poppins mt-1">{totalItems} items &bull; {formatPrice(totalPrice)}</p>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-amber/5 border border-amber/20 rounded-sm flex items-start gap-3">
          <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber/10 flex items-center justify-center text-amber"><AlertTriangle size={12} /></span>
          <p className="text-jet/70 text-sm font-poppins leading-relaxed">{error}</p>
        </div>}

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Section title="Contact Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <input type="text" placeholder="Full Name" value={contact.name} onChange={(e) => { setContact({ ...contact, name: e.target.value }); setFieldErrors((p) => ({ ...p, name: undefined })) }}
                    className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.name ? "border-burgundy" : "border-jet/10"}`} />
                  {fieldErrors.name && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.name}</p>}
                </div>
                <div>
                  <input type="email" placeholder="Email Address"
                    value={contact.email}
                    onChange={(e) => {
                      if (!isAuthenticated) {
                        setContact({ ...contact, email: e.target.value })
                        setFieldErrors((p) => ({ ...p, email: undefined }))
                      }
                    }}
                    disabled={isAuthenticated}
                    className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.email ? "border-burgundy" : "border-jet/10"} ${isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`} />
                  {fieldErrors.email && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <input type="tel" placeholder="Phone Number" value={contact.phone} onChange={(e) => { setContact({ ...contact, phone: e.target.value }); setFieldErrors((p) => ({ ...p, phone: undefined })) }}
                    className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.phone ? "border-burgundy" : "border-jet/10"}`} />
                  {fieldErrors.phone && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.phone}</p>}
                </div>
              </div>
            </Section>

            <Section title="Delivery Method">
              <div className="space-y-3">
                {deliveryMethods.map((dm) => (
                  <button key={dm.value} onClick={() => setDeliveryMethod(dm.value)}
                    className={`w-full flex items-center gap-4 p-4 border transition-all ${deliveryMethod === dm.value ? "border-gold bg-gold/5" : "border-jet/10 hover:border-jet/30"}`}>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === dm.value ? "border-gold" : "border-jet/20"}`}>
                      {deliveryMethod === dm.value && <span className="w-2.5 h-2.5 rounded-full bg-gold" />}
                    </span>
                    <div className="text-left flex-1">
                      <p className="font-poppins text-sm text-jet font-medium">{dm.label}</p>
                      <p className="text-jet/40 text-xs">{dm.desc}</p>
                    </div>
                    <span className="font-poppins text-sm text-jet font-medium">{dm.price === 0 ? "Free" : formatPrice(dm.price)}</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Delivery Address">
              <div className="space-y-4">
                <div>
                  <input type="text" placeholder="Street Address" value={address.street} onChange={(e) => { setAddress({ ...address, street: e.target.value }); setFieldErrors((p) => ({ ...p, street: undefined })) }}
                    className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.street ? "border-burgundy" : "border-jet/10"}`} />
                  {fieldErrors.street && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.street}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input type="text" placeholder="City" value={address.city} onChange={(e) => { setAddress({ ...address, city: e.target.value }); setFieldErrors((p) => ({ ...p, city: undefined })) }}
                      className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.city ? "border-burgundy" : "border-jet/10"}`} />
                    {fieldErrors.city && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.city}</p>}
                  </div>
                  <input type="text" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
                  <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50">
                    {ALLOWED_COUNTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
            </Section>

            <Section title="Billing Address">
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={sameAsShipping} onChange={() => setSameAsShipping(!sameAsShipping)}
                  className="w-4 h-4 accent-gold" />
                <span className="text-xs font-poppins text-jet/60">Same as delivery address</span>
              </label>
              {!sameAsShipping && (
                <div className="space-y-4">
                  <input type="text" placeholder="Street Address" value={billing.street} onChange={(e) => { setBilling({ ...billing, street: e.target.value }); setFieldErrors((p) => ({ ...p, b_street: undefined })) }}
                    className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.b_street ? "border-burgundy" : "border-jet/10"}`} />
                  {fieldErrors.b_street && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.b_street}</p>}
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" placeholder="City" value={billing.city} onChange={(e) => { setBilling({ ...billing, city: e.target.value }); setFieldErrors((p) => ({ ...p, b_city: undefined })) }}
                      className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.b_city ? "border-burgundy" : "border-jet/10"}`} />
                    <input type="text" placeholder="State" value={billing.state} onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                      className="h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
                    <select value={billing.country} onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                      className="h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50">
                      {ALLOWED_COUNTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>
              )}
            </Section>

            <Section title="Payment Method">
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <button key={pm.value} onClick={() => setPaymentMethod(pm.value)}
                    className={`w-full flex items-center gap-4 p-4 border transition-all ${paymentMethod === pm.value ? "border-gold bg-gold/5" : "border-jet/10 hover:border-jet/30"}`}>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.value ? "border-gold" : "border-jet/20"}`}>
                      {paymentMethod === pm.value && <span className="w-2.5 h-2.5 rounded-full bg-gold" />}
                    </span>
                    <div className="text-left">
                      <p className="font-poppins text-sm text-jet font-medium">{pm.label}</p>
                      <p className="text-jet/40 text-xs">{pm.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Gift Note (Optional)">
              <textarea value={giftNote} onChange={(e) => setGiftNote(e.target.value.slice(0, 500))} rows={2}
                placeholder="Add a personal message for the recipient..."
                className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none" />
            </Section>

            <Section title="Order Notes (Optional)">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 2000))} rows={2}
                placeholder="Any special requests or delivery instructions..."
                className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none" />
            </Section>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-16 border border-jet/5 bg-ivory">
              <div className="p-6 border-b border-jet/5"><h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Order Summary</h3></div>
              <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <Link href={`/shop/${item.slug}`} className="shrink-0 w-14 aspect-[3/4] overflow-hidden bg-cream">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.slug}`} className="font-poppins text-xs text-jet font-medium hover:text-gold transition-colors line-clamp-2">{item.name}</Link>
                      <p className="text-[10px] font-poppins text-jet/40 mt-0.5">{item.size && <span>Size: {item.size}</span>}{item.size && item.color && <span> &bull; </span>}{item.color && <span>{item.color}</span>}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex border border-jet/10">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-jet/40 hover:text-jet"><Minus size={9} /></button>
                          <span className="w-7 h-6 flex items-center justify-center text-[10px] font-poppins border-x border-jet/10">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-jet/40 hover:text-jet"><Plus size={9} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-poppins text-xs font-medium text-jet">{formatPrice(item.price * item.quantity)}</span>
                          <button onClick={() => removeItem(item.id)} className="text-jet/20 hover:text-burgundy"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-jet/5 space-y-3">
                <div className="flex justify-between text-sm font-poppins"><span className="text-jet/50">Subtotal</span><span className="text-jet font-medium">{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between text-sm font-poppins"><span className="text-jet/50">Delivery</span><span className={`font-medium ${deliveryFee === 0 ? "text-emerald" : "text-jet"}`}>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span></div>
                <div className="gold-divider" />
                <div className="flex justify-between text-base font-poppins"><span className="text-jet font-medium">Total</span><span className="text-jet font-bold">{formatPrice(finalTotal)}</span></div>
                <p className="text-[9px] font-poppins text-jet/30 mt-1 text-center">Cash or Transfer on Delivery</p>
                <button onClick={handlePlaceOrder} disabled={submitting}
                  className="w-full h-12 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe flex items-center justify-center gap-2 hover:bg-gold hover:text-jet transition-all duration-300 disabled:opacity-50">
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Placing Order...</> : <>Place Order &mdash; {formatPrice(finalTotal)}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-jet/5 bg-ivory p-6">
      <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-4">{title}</h3>
      {children}
    </div>
  )
}
