"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { formatPrice, cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/providers/cart-provider"
import { useToast } from "@/components/ui/toast"
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  ChevronDown,
  Heart,
  ShoppingBag,
  Eye,
  Search,
} from "lucide-react"

type DBProduct = Record<string, unknown>

const allFilters = {
  gender: ["men", "women", "unisex"],
  category: [
    "Bespoke", "Ready-to-Wear", "Evening Wear", "Wedding", "Corporate",
    "Traditional Wear", "Casual Essentials", "Luxury Evening Wear", "Accessories",
  ],
  fabric: [
    "Italian Wool Blend", "Silk Crepe de Chine", "Super 120s Wool", "French Lace & Silk",
    "Premium Linen", "Handwoven Aso Oke", "Italian Wool", "Silk Velvet",
    "Full-Grain Italian Leather", "Mongolian Cashmere",
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46"],
  season: ["All Season", "Spring/Summer", "Fall/Winter"],
  occasion: ["Corporate", "Evening", "Wedding", "Casual", "Traditional"],
  style: ["Classic", "Editorial", "Modern Classic", "Romantic", "Relaxed", "Contemporary Heritage", "Power Dressing", "Luxury", "Minimalist"],
  price: [
    { label: "Under ₦100K", min: 0, max: 100000 },
    { label: "₦100K - ₦250K", min: 100000, max: 250000 },
    { label: "₦250K - ₦500K", min: 250000, max: 500000 },
    { label: "₦500K - ₦1M", min: 500000, max: 1000000 },
    { label: "Over ₦1M", min: 1000000, max: Infinity },
  ],
}

type FilterKey = keyof typeof allFilters

interface FilterState {
  gender: string[]
  category: string[]
  fabric: string[]
  sizes: string[]
  season: string[]
  occasion: string[]
  style: string[]
  price: number[]
  search: string
}

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Best Rated", value: "rating" },
]

const PAGE_SIZE = 50

async function fetchProducts(limit = PAGE_SIZE, offset = 0): Promise<{ data: Record<string, unknown>[]; total: number }> {
  try {
    const countResult = await supabase.from("products").select("*", { count: "exact", head: true })
    const total = countResult.count || 0
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw error
    return { data: (data as Record<string, unknown>[]) || [], total }
  } catch {
    return { data: [], total: 0 }
  }
}

interface Product {
  id: string
  name: string
  slug: string
  category: string
  gender: string
  price: number
  originalPrice?: number
  description: string
  images: string[]
  fabric: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  rating: number
  reviewCount: number
  isNew?: boolean
  isBestseller?: boolean
  season?: string
  occasion?: string
  style?: string
  tailoringNotes?: string
  deliveryEstimate?: string
  preOrderEnabled?: boolean
  preOrderReleaseDate?: string
}

function toProduct(p: Record<string, unknown>): Product {
  return {
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
    category: p.category as string,
    gender: p.gender as string,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    description: p.description as string,
    images: (p.images as string[]) || [],
    fabric: p.fabric as string,
    sizes: (p.sizes as string[]) || [],
    colors: (p.colors as string[]) || [],
    inStock: p.in_stock as boolean,
    rating: Number(p.rating) || 0,
    reviewCount: Number(p.review_count) || 0,
    isNew: p.is_new as boolean,
    isBestseller: p.is_bestseller as boolean,
    season: p.season as string,
    occasion: p.occasion as string,
    style: p.style as string,
    tailoringNotes: p.tailoring_notes as string,
    deliveryEstimate: p.delivery_estimate as string,
    preOrderEnabled: p.pre_order_enabled as boolean,
    preOrderReleaseDate: p.pre_order_release_date as string | undefined,
  }
}

function ShopPageInner() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialSearch = searchParams.get("search") || ""
    return {
      gender: [], category: [], fabric: [], sizes: [], season: [], occasion: [], style: [], price: [], search: initialSearch,
    }
  })
  const [sort, setSort] = useState("newest")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts().then(({ data, total }) => {
      setProducts(data.map(toProduct))
      setTotalProducts(total)
      setLoading(false)
    })
  }, [])

  const loadMore = async () => {
    setLoadingMore(true)
    const { data } = await fetchProducts(PAGE_SIZE, products.length)
    setProducts((prev) => [...prev, ...data.map(toProduct)])
    setLoadingMore(false)
  }

  const hasMore = products.length < totalProducts

  const filtered = useMemo(() => {
    let result = [...products]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q))
    }
    if (filters.gender.length) result = result.filter((p) => filters.gender.includes(p.gender))
    if (filters.category.length) result = result.filter((p) => filters.category.includes(p.category))
    if (filters.fabric.length) result = result.filter((p) => filters.fabric.includes(p.fabric))
    if (filters.sizes.length) result = result.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)))
    if (filters.season.length) result = result.filter((p) => p.season && filters.season.includes(p.season))
    if (filters.occasion.length) result = result.filter((p) => p.occasion && filters.occasion.includes(p.occasion))
    if (filters.style.length) result = result.filter((p) => p.style && filters.style.includes(p.style))
    if (filters.price.length) {
      result = result.filter((p) => {
        const ranges = filters.price.map((i) => allFilters.price[i])
        return ranges.some((r) => p.price >= r.min && p.price <= r.max)
      })
    }
    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break
      case "price-desc": result.sort((a, b) => b.price - a.price); break
      case "rating": result.sort((a, b) => b.rating - a.rating); break
    }
    return result
  }, [filters, sort, products])

  const toggleFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter((v) => v !== value)
        : [...(prev[key] as string[]), value],
    }))
  }

  const togglePriceFilter = (index: number) => {
    setFilters((prev) => ({
      ...prev,
      price: prev.price.includes(index) ? prev.price.filter((i) => i !== index) : [...prev.price, index],
    }))
  }

  const clearFilters = () => {
    setFilters({ gender: [], category: [], fabric: [], sizes: [], season: [], occasion: [], style: [], price: [], search: "" })
  }

  const hasActiveFilters = Object.values(filters).some((v) => (Array.isArray(v) && v.length > 0) || (typeof v === "string" && v))
  const activeCount = Object.values(filters).reduce((acc, v) => {
    if (Array.isArray(v)) return acc + v.length
    if (typeof v === "string" && v) return acc + 1
    return acc
  }, 0)

  const FilterCheckbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <span className={cn("w-4 h-4 border flex items-center justify-center transition-all duration-300", checked ? "bg-jet border-jet" : "border-jet/20 group-hover:border-jet/50")}>
        {checked && <X size={10} className="text-cream" />}
      </span>
      <span className="text-sm text-jet/70 group-hover:text-jet transition-colors">{label}</span>
    </label>
  )

  if (loading) {
    return (
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-jet/40 text-sm mt-4">Loading collections...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (filters.search.trim().length >= 2) {
      fetch("/api/search/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: filters.search }),
      }).catch(() => {})
    }
  }, [filters.search])

  return (
    <div className="pt-[72px] lg:pt-20">
      <div className="bg-jet text-cream py-16 lg:py-20">
        <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <span className="font-serif-lux text-gold text-sm tracking-luxe-sm">Collections</span>
            <h1 className="font-display text-5xl lg:text-7xl text-cream mt-2">The YSI Shop</h1>
            <p className="text-cream/50 text-sm mt-3 max-w-md">Discover our curated collections. Each piece reflects our commitment to exceptional craftsmanship and timeless style.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 font-poppins text-[11px] uppercase tracking-luxe text-jet/70 hover:text-jet transition-colors">
              <SlidersHorizontal size={15} /> Filters
              {activeCount > 0 && <span className="bg-jet text-cream text-[9px] w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
            </button>
            {hasActiveFilters && <button onClick={clearFilters} className="text-[10px] font-poppins uppercase tracking-luxe text-jet/40 hover:text-burgundy transition-colors">Clear all</button>}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-jet/40 text-sm hidden lg:block">{filtered.length} products</p>
            <div className="hidden lg:flex border border-jet/10">
              <button onClick={() => setView("grid")} className={cn("p-2 transition-colors", view === "grid" ? "bg-jet text-cream" : "text-jet/40 hover:text-jet")}><Grid3X3 size={15} /></button>
              <button onClick={() => setView("list")} className={cn("p-2 transition-colors", view === "list" ? "bg-jet text-cream" : "text-jet/40 hover:text-jet")}><List size={15} /></button>
            </div>
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-transparent border border-jet/10 h-10 pl-4 pr-8 text-sm font-poppins text-jet/70 focus:outline-none focus:border-jet/30 cursor-pointer">
                {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-jet/40 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-10">
          <motion.aside initial={false}
            animate={{ width: showFilters ? 260 : 0, opacity: showFilters ? 1 : 0, marginRight: showFilters ? 0 : -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block overflow-hidden shrink-0">
            {showFilters && (
              <div className="w-[260px] space-y-8 pr-4 border-r border-jet/5">
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Search</h4>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-jet/30" />
                    <input type="text" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      placeholder="Search products..." className="w-full h-10 pl-9 pr-3 bg-transparent border border-jet/10 text-sm text-jet placeholder:text-jet/30 focus:outline-none focus:border-jet/30" />
                  </div>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Gender</h4>
                  <div className="space-y-2">{allFilters.gender.map((g) => (<FilterCheckbox key={g} label={g === "unisex" ? "Unisex" : g.charAt(0).toUpperCase() + g.slice(1)} checked={filters.gender.includes(g)} onChange={() => toggleFilter("gender", g)} />))}</div>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Category</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">{allFilters.category.map((c) => (<FilterCheckbox key={c} label={c} checked={filters.category.includes(c)} onChange={() => toggleFilter("category", c)} />))}</div>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Price Range</h4>
                  <div className="space-y-2">{allFilters.price.map((p, i) => (<FilterCheckbox key={i} label={p.label} checked={filters.price.includes(i)} onChange={() => togglePriceFilter(i)} />))}</div>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Fabric</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">{allFilters.fabric.map((f) => (<FilterCheckbox key={f} label={f} checked={filters.fabric.includes(f)} onChange={() => toggleFilter("fabric", f)} />))}</div>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Season</h4>
                  <div className="space-y-2">{allFilters.season.map((s) => (<FilterCheckbox key={s} label={s} checked={filters.season.includes(s)} onChange={() => toggleFilter("season", s)} />))}</div>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Occasion</h4>
                  <div className="space-y-2">{allFilters.occasion.map((o) => (<FilterCheckbox key={o} label={o} checked={filters.occasion.includes(o)} onChange={() => toggleFilter("occasion", o)} />))}</div>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Style</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">{allFilters.style.map((s) => (<FilterCheckbox key={s} label={s} checked={filters.style.includes(s)} onChange={() => toggleFilter("style", s)} />))}</div>
                </div>
                <div>
                  <h4 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/50 mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">{allFilters.sizes.map((s) => (
                    <button key={s} onClick={() => toggleFilter("sizes", s)}
                      className={cn("w-10 h-10 border text-xs font-poppins transition-all duration-300", filters.sizes.includes(s) ? "bg-jet text-cream border-jet" : "border-jet/10 text-jet/50 hover:border-jet/30")}>{s}</button>
                  ))}</div>
                </div>
              </div>
            )}
          </motion.aside>

          <div className="flex-1 min-w-0">
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(filters).map(([key, values]) => {
                  if (key === "search" && values) return (
                    <span key="search" className="inline-flex items-center gap-1.5 bg-jet/5 text-jet/70 text-[10px] font-poppins uppercase tracking-luxe px-3 py-1.5">
                      Search: {values as string}
                      <button onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}><X size={11} /></button>
                    </span>
                  )
                  if (key === "price" && (values as number[]).length) return (values as number[]).map((i) => (
                    <span key={`price-${i}`} className="inline-flex items-center gap-1.5 bg-jet/5 text-jet/70 text-[10px] font-poppins uppercase tracking-luxe px-3 py-1.5">
                      {allFilters.price[i].label}
                      <button onClick={() => togglePriceFilter(i)}><X size={11} /></button>
                    </span>
                  ))
                  if (key !== "search" && key !== "price" && (values as string[]).length) return (values as string[]).map((v) => (
                    <span key={`${key}-${v}`} className="inline-flex items-center gap-1.5 bg-jet/5 text-jet/70 text-[10px] font-poppins uppercase tracking-luxe px-3 py-1.5">
                      {v}
                      <button onClick={() => toggleFilter(key as FilterKey, v)}><X size={11} /></button>
                    </span>
                  ))
                  return null
                })}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display text-3xl text-jet/30">No products match your filters.</p>
                <button onClick={clearFilters} className="mt-4 h-10 px-6 border border-jet/10 text-sm font-poppins text-jet/60 hover:bg-jet hover:text-cream transition-all">Clear Filters</button>
              </div>
            ) : (
              <>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible"
                  className={cn(view === "grid" ? "grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" : "flex flex-col gap-6")}>
                  {filtered.map((product) => (<ProductCard key={product.id} product={product} view={view} />))}
                </motion.div>
                {hasMore && filtered.length >= products.length && (
                  <div className="text-center mt-10">
                    <button onClick={loadMore} disabled={loadingMore}
                      className="h-11 px-8 border border-jet/10 text-xs font-poppins uppercase tracking-luxe text-jet/60 hover:bg-jet hover:text-cream transition-all disabled:opacity-50">
                      {loadingMore ? "Loading..." : `Load More (${products.length}/${totalProducts})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopPageInner />
    </Suspense>
  )
}

function ProductCard({ product, view }: { product: Product; view: "grid" | "list" }) {
  const { addItem, toggleCart } = useCart()
  const { toast } = useToast()
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    addItem({
      id: product.id, name: product.name, price: product.price, image: product.images[0], slug: product.slug,
      isPreOrder: product.preOrderEnabled === true,
      preOrderReleaseDate: product.preOrderReleaseDate,
    })
    toggleCart()
    toast({ title: product.preOrderEnabled ? "Pre-order added" : "Added to cart", description: product.name, variant: "success" })
  }

  if (view === "list") {
    return (
      <motion.div variants={fadeUp} className="flex gap-6 bg-cream border border-jet/5 group">
        <Link href={`/shop/${product.slug}`} className="shrink-0 w-48 aspect-[3/4] overflow-hidden">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" loading="lazy" />
        </Link>
        <div className="flex-1 py-4 pr-4">
          <p className="text-jet/40 text-[10px] font-poppins uppercase tracking-luxe">{product.category}</p>
          <Link href={`/shop/${product.slug}`}><h3 className="font-poppins text-base text-jet font-medium mt-1 group-hover:text-gold transition-colors">{product.name}</h3></Link>
          <p className="text-jet/60 text-sm mt-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="font-poppins text-lg font-medium text-jet">{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="text-jet/40 line-through text-sm">{formatPrice(product.originalPrice)}</span>}
            <span className="text-jet/30 text-xs">{product.fabric}</span>
          </div>
          {product.preOrderEnabled && (
            <p className="text-[9px] font-poppins text-gold mt-1">Pre-Order &bull; {product.preOrderReleaseDate ? `Ships ${new Date(product.preOrderReleaseDate as string).toLocaleDateString()}` : "Coming Soon"}</p>
          )}
          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleAdd} className="h-9 px-5 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all duration-300">Add to Cart</button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="w-9 h-9 border border-jet/10 flex items-center justify-center text-jet/40 hover:text-gold transition-colors"><Heart size={14} /></button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="w-9 h-9 border border-jet/10 flex items-center justify-center text-jet/40 hover:text-gold transition-colors"><Eye size={14} /></button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeUp} className="group bg-cream overflow-hidden">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img src={product.images[0]} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-jet/0 group-hover:bg-jet/30 transition-all duration-500" />
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex gap-1.5">
              <button onClick={handleAdd} className="flex-1 h-9 bg-cream text-jet text-[9px] font-poppins uppercase tracking-luxe flex items-center justify-center gap-1 hover:bg-gold transition-colors duration-300"><ShoppingBag size={12} /> Cart</button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="w-9 h-9 bg-cream text-jet flex items-center justify-center hover:bg-gold transition-colors duration-300"><Heart size={12} /></button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="w-9 h-9 bg-cream text-jet flex items-center justify-center hover:bg-gold transition-colors duration-300"><Eye size={12} /></button>
            </div>
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && <Badge variant="gold">New</Badge>}
            {product.isBestseller && <Badge variant="default">Bestseller</Badge>}
            {product.preOrderEnabled && <Badge variant="gold">Pre-Order</Badge>}
          </div>
        </div>
        <div className="p-3 lg:p-4">
          <p className="text-jet/40 text-[9px] font-poppins uppercase tracking-luxe">{product.category}</p>
          <h3 className="font-poppins text-sm text-jet font-medium mt-0.5 leading-tight group-hover:text-gold transition-colors">{product.name}</h3>
          <span className="font-poppins text-sm font-medium text-jet mt-1 block">{formatPrice(product.price)}</span>
          {product.preOrderEnabled && (
            <span className="text-[9px] font-poppins text-gold block mt-0.5">
              {product.preOrderReleaseDate ? `Pre-Order · Ships ${new Date(product.preOrderReleaseDate as string).toLocaleDateString()}` : "Coming Soon"}
            </span>
          )}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? "text-gold" : "text-jet/10"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}</div>
            <span className="text-jet/30 text-[9px]">({product.reviewCount})</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
