"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { formatPrice, cn } from "@/lib/utils"
import { fadeUp } from "@/lib/motion"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/providers/cart-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/toast"
import { friendlyError } from "@/lib/friendly-error"
import {
  Heart, Share2, ChevronLeft, ChevronRight, Star, Minus, Plus, Truck, Shield, RotateCcw, MessageCircle, AlertTriangle, Loader2, Check, X
} from "lucide-react"

interface Product {
  id: string; name: string; slug: string; category: string; gender: string
  price: number; originalPrice?: number; description: string; images: string[]
  fabric: string; sizes: string[]; colors: string[]; inStock: boolean
  rating: number; reviewCount: number; isNew?: boolean; isBestseller?: boolean
  tailoringNotes?: string; deliveryEstimate?: string
  preOrderEnabled?: boolean; preOrderReleaseDate?: string; preOrderDeposit?: number
}

async function fetchProductBySlug(slug: string): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle()
    if (error) throw error
    return data as Record<string, unknown> | null
  } catch {
    return null
  }
}

async function fetchRelatedProducts(category: string, gender: string, excludeId: string): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`category.eq.${category},gender.eq.${gender}`)
      .neq("id", excludeId)
      .limit(4)
    if (error) throw error
    return (data as Record<string, unknown>[]) || []
  } catch {
    return []
  }
}

function toProduct(p: Record<string, unknown>): Product {
  return {
    id: p.id as string, name: p.name as string, slug: p.slug as string, category: p.category as string,
    gender: p.gender as string, price: Number(p.price), originalPrice: p.original_price ? Number(p.original_price) : undefined,
    description: p.description as string, images: (p.images as string[]) || [], fabric: p.fabric as string,
    sizes: (p.sizes as string[]) || [], colors: (p.colors as string[]) || [], inStock: p.in_stock as boolean,
    rating: Number(p.rating) || 0, reviewCount: Number(p.review_count) || 0, isNew: p.is_new as boolean,
    isBestseller: p.is_bestseller as boolean, tailoringNotes: p.tailoring_notes as string, deliveryEstimate: p.delivery_estimate as string,
    preOrderEnabled: p.pre_order_enabled as boolean, preOrderReleaseDate: p.pre_order_release_date as string | undefined,
    preOrderDeposit: p.pre_order_deposit ? Number(p.pre_order_deposit) : undefined,
  }
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [recommended, setRecommended] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details")
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [inWishlist, setInWishlist] = useState(false)
  const [reviews, setReviews] = useState<{ id: string; rating: number; title: string | null; body: string | null; customer: { name: string } | null; created_at: string; images: string[] }[]>([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const { addItem, toggleCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id, name: product.name, price: product.price, image: product.images[0],
      quantity, size: selectedSize || undefined, color: selectedColor || undefined, slug: product.slug,
      isPreOrder: product.preOrderEnabled === true,
      preOrderReleaseDate: product.preOrderReleaseDate,
    })
    toggleCart()
    toast({ title: product.preOrderEnabled ? "Pre-order added" : "Added to cart", description: product.name, variant: "success" })
  }

  useEffect(() => {
    async function load() {
      const found = await fetchProductBySlug(params.slug as string)
      if (found) {
        const product = toProduct(found)
        setProduct(product)
        const related = await fetchRelatedProducts(product.category, product.gender, product.id)
        setRecommended(related.map(toProduct))
      }
      setLoading(false)
    }
    load()
  }, [params.slug])

  useEffect(() => {
    if (!product) return
    if (isAuthenticated) {
      supabase.from("wishlists").select("id").eq("product_id", product.id).maybeSingle().then(({ data }) => setInWishlist(!!data))
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user?.id) return
        supabase.from("recently_viewed").upsert(
          { user_id: user.id, product_id: product.id, viewed_at: new Date().toISOString() },
          { onConflict: "user_id, product_id" }
        ).then(({ error }) => {
          if (error) console.error("Failed to track recently viewed:", error)
        })
      })
    } else {
      const viewed = JSON.parse(localStorage.getItem("ysi_recently_viewed") || "[]") as string[]
      const updated = [product.id, ...viewed.filter((id) => id !== product.id)].slice(0, 20)
      localStorage.setItem("ysi_recently_viewed", JSON.stringify(updated))
    }
  }, [product?.id, isAuthenticated])

  useEffect(() => {
    if (!product) return
    fetch(`/api/products/${product.slug}/reviews`).then((r) => r.json()).then((data) => {
      if (data.reviews) setReviews(data.reviews)
    }).catch(() => {})
  }, [product?.slug, product])

  const handleSubmitReview = async () => {
    if (!product || !isAuthenticated) return
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${product.slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit review")
      toast({ title: "Review submitted", description: "Your review is pending moderation.", variant: "success" })
      setReviewForm({ rating: 5, title: "", body: "" })
    } catch (err) {
      toast({ title: "Failed to submit", description: friendlyError(err), variant: "error" })
    } finally {
      setSubmittingReview(false)
    }
  }

  const toggleWishlist = async () => {
    if (!isAuthenticated || !product) {
      toast({ title: "Sign in required", description: "Please sign in to add items to your wishlist.", variant: "info" })
      return
    }
    if (inWishlist) {
      await supabase.from("wishlists").delete().eq("product_id", product.id)
      setInWishlist(false)
      toast({ title: "Removed from wishlist", variant: "info" })
    } else {
      await supabase.from("wishlists").insert({ product_id: product.id })
      setInWishlist(true)
      toast({ title: "Added to wishlist", variant: "success" })
    }
  }

  if (loading) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-jet/30">Product not found</h1>
          <Link href="/shop" className="mt-4 inline-flex items-center h-10 px-6 border border-jet/10 text-sm font-poppins text-jet/60 hover:bg-jet hover:text-cream transition-all">Back to Shop</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[72px] lg:pt-20">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-6">
        <nav className="flex items-center gap-2 text-xs font-poppins text-jet/40">
          <Link href="/" className="hover:text-jet transition-colors">Home</Link><span>/</span>
          <Link href="/shop" className="hover:text-jet transition-colors">Shop</Link><span>/</span>
          <Link href={`/shop?gender=${product.gender}`} className="hover:text-jet transition-colors capitalize">{product.gender}</Link><span>/</span>
          <span className="text-jet/70">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="relative aspect-[4/5] overflow-hidden cursor-crosshair group" onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }) }}>
              <img src={product.images[selectedImage]} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-150" style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }} />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge variant="gold">New Arrival</Badge>}
                {product.isBestseller && <Badge variant="default">Bestseller</Badge>}
                {product.preOrderEnabled && <Badge variant="gold">Pre-Order</Badge>}
              </div>
              <button onClick={toggleWishlist} className={`absolute top-4 right-4 w-11 h-11 bg-cream/80 backdrop-blur flex items-center justify-center transition-colors ${inWishlist ? "text-gold" : "text-jet/60 hover:text-gold"}`}><Heart size={17} fill={inWishlist ? "currentColor" : "none"} /></button>
              {product.images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage((prev) => prev === 0 ? product.images.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-cream/80 backdrop-blur flex items-center justify-center text-jet/60 hover:text-jet transition-colors"><ChevronLeft size={18} /></button>
                  <button onClick={() => setSelectedImage((prev) => prev === product.images.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-cream/80 backdrop-blur flex items-center justify-center text-jet/60 hover:text-jet transition-colors"><ChevronRight size={18} /></button>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={cn("w-20 h-24 overflow-hidden border-2 transition-all duration-300", i === selectedImage ? "border-gold" : "border-transparent opacity-60 hover:opacity-100")}>
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
            <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">{product.category}</span>
            <h1 className="font-display text-4xl lg:text-5xl text-jet mt-2 leading-[1.08]">{product.name}</h1>
            <div className="flex items-center gap-3 mt-4">
              <span className="font-poppins text-2xl font-medium text-jet">{formatPrice(product.price)}</span>
              {product.originalPrice && <><span className="font-poppins text-lg text-jet/30 line-through">{formatPrice(product.originalPrice)}</span><Badge variant="burgundy">Save {formatPrice(product.originalPrice - product.price)}</Badge></>}
            </div>
            {product.preOrderEnabled && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] font-poppins text-gold uppercase tracking-luxe font-medium">
                  {product.preOrderReleaseDate ? `Available ${new Date(product.preOrderReleaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : "Coming Soon"}
                </p>
                {product.preOrderDeposit ? (
                  <p className="text-[10px] font-poppins text-jet/50">Deposit of {formatPrice(product.preOrderDeposit)} required to secure your pre-order</p>
                ) : (
                  <p className="text-[10px] font-poppins text-jet/50">Full payment due at checkout. Your item will ship on the release date.</p>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={15} className={i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-jet/10"} />))}</div>
              <span className="text-jet/50 text-sm">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
            <p className="text-jet/70 text-sm leading-relaxed mt-6">{product.description}</p>
            <div className="flex items-center gap-2 mt-4 text-sm text-jet/60">
              <span className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">Fabric:</span>
              <span>{product.fabric}</span>
            </div>
            <div className="gold-divider my-8" />
            <div>
              <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-3">Color &mdash; <span className="text-jet">{selectedColor || "Select"}</span></h4>
              <div className="flex flex-wrap gap-2">{product.colors.map((color) => (
                <button key={color} onClick={() => setSelectedColor(color)} className={cn("h-10 px-4 border text-xs font-poppins transition-all duration-300", selectedColor === color ? "bg-jet text-cream border-jet" : "border-jet/10 text-jet/60 hover:border-jet/30")}>{color}</button>
              ))}</div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-3">Size &mdash; <span className="text-jet">{selectedSize || "Select"}</span></h4>
                <Link href="/size-guide" className="text-[10px] font-poppins uppercase tracking-luxe text-gold hover:text-gold-light transition-colors">Size Guide</Link>
              </div>
              <div className="flex flex-wrap gap-2">{product.sizes.map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={cn("w-12 h-12 border text-xs font-poppins transition-all duration-300", selectedSize === size ? "bg-jet text-cream border-jet" : "border-jet/10 text-jet/60 hover:border-jet/30")}>{size}</button>
              ))}</div>
            </div>
            <div className="mt-8">
              <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-3">Quantity</h4>
              <div className="flex items-center gap-4">
                <div className="flex border border-jet/10">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center text-jet/50 hover:text-jet transition-colors"><Minus size={14} /></button>
                  <span className="w-12 h-11 flex items-center justify-center text-sm font-poppins border-x border-jet/10">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center text-jet/50 hover:text-jet transition-colors"><Plus size={14} /></button>
                </div>
                <span className="text-jet/40 text-sm font-poppins">{product.preOrderEnabled ? "Pre-Order Now" : product.inStock ? "In Stock" : "Made to Order"}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button onClick={handleAddToCart} className="flex-1 h-12 bg-jet text-cream text-xs font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all duration-300">Add to Cart</button>
              <button className="flex-1 h-12 border border-gold text-gold text-xs font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all duration-300">Buy Now</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8 p-6 bg-ivory">
              <div className="text-center"><Truck size={18} className="mx-auto text-gold" /><p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/60 mt-2">{product.deliveryEstimate || "5-7 Days"}</p></div>
              <div className="text-center"><Shield size={18} className="mx-auto text-gold" /><p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/60 mt-2">Premium Quality</p></div>
              <div className="text-center"><RotateCcw size={18} className="mx-auto text-gold" /><p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/60 mt-2">Easy Returns</p></div>
            </div>
            <div className="flex items-center gap-6 mt-6 text-jet/40">
              <button onClick={toggleWishlist} className={`flex items-center gap-1.5 text-xs transition-colors ${inWishlist ? "text-gold" : "text-jet/40 hover:text-jet"}`}><Heart size={14} fill={inWishlist ? "currentColor" : "none"} /> {inWishlist ? "In Wishlist" : "Add to Wishlist"}</button>
              <button className="flex items-center gap-1.5 text-xs hover:text-jet transition-colors"><Share2 size={14} /> Share</button>
            </div>
            {product.tailoringNotes && (
              <div className="mt-8 p-6 border border-gold/20 bg-gold/5">
                <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-gold mb-2">Tailoring Notes</h4>
                <p className="text-jet/70 text-sm">{product.tailoringNotes}</p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-20">
          <div className="flex border-b border-jet/10">
            {["details", "reviews"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as typeof activeTab)}
                className={cn("px-8 py-4 font-poppins text-[11px] uppercase tracking-luxe transition-all duration-300 border-b-2 -mb-[1px]", activeTab === tab ? "text-jet border-jet" : "text-jet/30 border-transparent hover:text-jet/60")}>
                {tab === "details" ? "Fabric & Details" : "Reviews & Q&A"}
              </button>
            ))}
          </div>
          <div className="py-10">
            {activeTab === "details" ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-10">
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-3">Fabric & Care</h4>
                  <p className="text-jet/70 text-sm leading-relaxed">{product.fabric}. This premium fabric has been selected for its quality, drape, and durability. Professional dry clean recommended.</p>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-3">Fit & Sizing</h4>
                  <p className="text-jet/70 text-sm leading-relaxed">Designed for a tailored fit. Size guide available. Includes complimentary alterations on all bespoke pieces.</p>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-3">Delivery & Returns</h4>
                  <p className="text-jet/70 text-sm leading-relaxed">Estimated delivery: {product.deliveryEstimate || "5-7 business days"}. Free shipping on orders over ₦150,000.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="flex items-start gap-4 p-6 bg-ivory">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-sm font-poppins font-medium shrink-0">
                        {(review.customer?.name || "A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-poppins text-sm font-medium text-jet">{review.customer?.name || "Anonymous"}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} className={i < review.rating ? "text-gold fill-gold" : "text-jet/10"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-jet/40 text-xs mt-0.5">Verified Purchase &bull; {new Date(review.created_at).toLocaleDateString()}</p>
                        {review.title && <p className="font-poppins text-sm text-jet font-medium mt-2">{review.title}</p>}
                        {review.body && <p className="text-jet/70 text-sm mt-1 leading-relaxed">{review.body}</p>}
                        {review.images?.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-jet/40 text-sm font-poppins text-center py-8">No reviews yet. Be the first to review.</p>
                )}

                {/* Review Form */}
                {isAuthenticated && (
                  <div className="p-6 border border-jet/10">
                    <h4 className="font-poppins text-sm text-jet font-medium mb-4">Write a Review</h4>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}>
                          <Star size={18} className={star <= reviewForm.rating ? "text-gold fill-gold" : "text-jet/20"} />
                        </button>
                      ))}
                    </div>
                    <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value.slice(0, 200) }))}
                      placeholder="Review title (optional)" maxLength={200}
                      className="w-full h-11 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 mb-3" />
                    <textarea value={reviewForm.body} onChange={(e) => setReviewForm((p) => ({ ...p, body: e.target.value.slice(0, 2000) }))}
                      rows={3} placeholder="Share your experience..." maxLength={2000}
                      className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none mb-3" />
                    <button onClick={handleSubmitReview} disabled={submittingReview}
                      className="h-10 px-5 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all disabled:opacity-50">
                      {submittingReview ? <Loader2 size={12} className="animate-spin" /> : "Submit Review"}
                    </button>
                  </div>
                )}

                <div className="p-6 border border-jet/10">
                  <div className="flex items-center gap-3"><MessageCircle size={16} className="text-gold" /><span className="font-poppins text-sm text-jet font-medium">Have a question?</span></div>
                  <p className="text-jet/50 text-sm mt-1">Our styling team is here to help. Reach out via live chat or WhatsApp.</p>
                  <button className="mt-3 h-9 px-5 border border-jet/10 text-xs font-poppins uppercase tracking-luxe text-jet/60 hover:bg-jet hover:text-cream transition-all">Ask a Question</button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-16 p-8 lg:p-12 bg-jet text-cream">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">Styling Note</span>
              <h3 className="font-display text-3xl lg:text-4xl text-cream mt-2">Style It Your Way</h3>
              <p className="text-cream/50 text-sm mt-3 leading-relaxed">Book a complimentary styling consultation with our experts for a complete look.</p>
              <button className="mt-6 h-10 px-6 bg-gold text-jet text-xs font-poppins uppercase tracking-luxe hover:bg-gold-light transition-all">Book a Stylist</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <img src={product.images[0]} alt="Style suggestion" className="aspect-square object-cover" />
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80" alt="Style suggestion" className="aspect-square object-cover" />
            </div>
          </div>
        </div>

        {recommended.length > 0 && (
          <div className="mt-16">
            <h3 className="font-display text-3xl text-jet mb-8">Frequently Bought Together</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {recommended.map((rec) => (
                <Link key={rec.id} href={`/shop/${rec.slug}`} className="group">
                  <div className="aspect-[3/4] overflow-hidden"><img src={rec.images[0]} alt={rec.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" loading="lazy" /></div>
                  <div className="mt-3">
                    <p className="text-jet/40 text-[9px] font-poppins uppercase tracking-luxe">{rec.category}</p>
                    <p className="font-poppins text-sm text-jet mt-0.5 group-hover:text-gold transition-colors">{rec.name}</p>
                    <span className="font-poppins text-sm font-medium text-jet">{formatPrice(rec.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 lg:hidden">
        <div className="glass-dark px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-cream text-xs font-poppins font-medium">{product.name}</p>
              <span className="text-gold text-sm font-poppins font-medium">{formatPrice(product.price)}</span>
            </div>
            <button onClick={handleAddToCart} className="h-10 px-5 bg-gold text-jet text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold-light transition-all shrink-0">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  )
}
