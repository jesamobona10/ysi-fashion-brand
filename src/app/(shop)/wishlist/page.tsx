"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ShoppingBag, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/components/providers/cart-provider"
import { useToast } from "@/components/ui/toast"
import { staggerContainer, fadeUp } from "@/lib/motion"

interface WishlistProduct {
  id: string
  name: string
  slug: string
  price: number
  original_price?: number
  images: string[]
  fabric: string
  in_stock: boolean
  rating: number
}

export default function WishlistPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem, toggleCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return
    const load = async () => {
      const { data: wishlistItems } = await supabase
        .from("wishlists")
        .select("product_id")
        .order("created_at", { ascending: false })

      if (!wishlistItems || wishlistItems.length === 0) {
        setLoading(false)
        return
      }

      const ids = wishlistItems.map((w) => w.product_id)
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, slug, price, original_price, images, fabric, in_stock, rating")
        .in("id", ids)

      if (productsData) {
        const ordered = ids.map((id) => productsData.find((p) => p.id === id)).filter(Boolean) as WishlistProduct[]
        setProducts(ordered)
      }
      setLoading(false)
    }
    void load()
  }, [isAuthenticated])

  const removeFromWishlist = async (productId: string) => {
    await supabase.from("wishlists").delete().eq("product_id", productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    toast({ title: "Removed from wishlist", variant: "info" })
  }

  const handleAddToCart = (product: WishlistProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
      slug: product.slug,
    })
    toast({ title: "Added to cart", description: product.name, variant: "success" })
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="w-9 h-9 rounded-lg border border-jet/10 flex items-center justify-center text-jet/40 hover:text-jet transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-3xl text-jet">Wishlist</h1>
            <p className="text-jet/50 text-sm font-poppins mt-1">{products.length} {products.length === 1 ? "item" : "items"}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-jet/10" />
            <p className="font-poppins text-sm text-jet/40 mt-4">Your wishlist is empty</p>
            <Link href="/shop" className="inline-flex items-center mt-6 h-10 px-6 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all">
              Browse Products
            </Link>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={fadeUp} className="group relative bg-cream overflow-hidden border border-jet/5">
                <Link href={`/shop/${product.slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img src={product.images?.[0]} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-jet/0 group-hover:bg-jet/30 transition-all duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="text-jet/50 text-[10px] font-poppins uppercase tracking-luxe mb-1">{product.fabric}</p>
                    <h3 className="font-poppins text-sm text-jet font-medium leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-poppins text-sm font-medium text-jet">{formatPrice(product.price)}</span>
                      {product.original_price && <span className="font-poppins text-xs text-jet/40 line-through">{formatPrice(product.original_price)}</span>}
                    </div>
                  </div>
                </Link>
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button onClick={() => removeFromWishlist(product.id)}
                    className="w-8 h-8 bg-cream flex items-center justify-center shadow-sm hover:bg-burgundy hover:text-cream transition-all">
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => handleAddToCart(product)}
                    className="w-8 h-8 bg-cream flex items-center justify-center shadow-sm hover:bg-jet hover:text-cream transition-all">
                    <ShoppingBag size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
