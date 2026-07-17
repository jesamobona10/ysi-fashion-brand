"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Heart, Share2, Check, Sparkles } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/components/providers/cart-provider"
import { useToast } from "@/components/ui/toast"
import type { StyledOutfit } from "@/lib/ai/stylist"

interface OutfitDisplayProps {
  outfits: StyledOutfit[]
}

export function OutfitDisplay({ outfits }: OutfitDisplayProps) {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const { addItem } = useCart()
  const { toast } = useToast()

  function handleAddAll(outfit: StyledOutfit) {
    if (addedIds.has(outfit.id)) return
    outfit.items.forEach((item) => {
      addItem({
        id: item.productId,
        slug: item.slug,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        color: item.color,
      })
    })
    setAddedIds((prev) => new Set(prev).add(outfit.id))
    toast({ title: `"${outfit.name}" added to cart`, variant: "success" })
  }

  if (outfits.length === 0) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
          <Sparkles size={14} className="text-gold" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-jet">Your Curated Looks</h2>
          <p className="text-jet/40 text-xs font-poppins">{outfits.length} outfit{outfits.length > 1 ? "s" : ""} styled for you</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {outfits.map((outfit, i) => (
          <motion.div
            key={outfit.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="border border-jet/5 bg-ivory"
          >
            <div className="p-5 border-b border-jet/5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-jet">{outfit.name}</h3>
                <p className="text-jet/50 text-xs font-poppins mt-0.5">{outfit.description.slice(0, 90)}</p>
              </div>
              <span className="font-poppins text-sm font-bold text-jet shrink-0 ml-4">{formatPrice(outfit.totalPrice)}</span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {outfit.items.map((item, j) => (
                  <Link key={item.productId} href={`/shop/${item.slug}`}
                    className="group block">
                    <div className="aspect-[3/4] overflow-hidden bg-cream relative">
                      <img src={item.image} alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-jet/0 group-hover:bg-jet/10 transition-colors" />
                    </div>
                    <div className="mt-2">
                      <p className="text-[10px] font-poppins text-jet font-medium leading-tight line-clamp-2 group-hover:text-gold transition-colors">{item.name}</p>
                      <p className="text-[9px] font-poppins text-jet/40 mt-0.5">{item.color}</p>
                      <p className="text-[10px] font-poppins text-jet font-medium mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-5 pb-4">
              <p className="text-[10px] font-poppins text-jet/50 italic leading-relaxed">
                <span className="not-italic font-medium text-jet/70">Style Note: </span>
                {outfit.styleNotes}
              </p>
            </div>

            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => handleAddAll(outfit)}
                className={`flex-1 h-10 text-[10px] font-poppins uppercase tracking-luxe flex items-center justify-center gap-2 transition-all ${addedIds.has(outfit.id) ? "bg-emerald text-cream" : "bg-jet text-cream hover:bg-gold hover:text-jet"}`}>
                {addedIds.has(outfit.id) ? <><Check size={12} /> Added to Cart</> : <><ShoppingBag size={12} /> Add All to Cart</>}
              </button>
              <button className="w-10 h-10 border border-jet/10 flex items-center justify-center text-jet/30 hover:text-jet transition-colors" aria-label="Save outfit">
                <Heart size={13} />
              </button>
              <button className="w-10 h-10 border border-jet/10 flex items-center justify-center text-jet/30 hover:text-jet transition-colors" aria-label="Share outfit">
                <Share2 size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
