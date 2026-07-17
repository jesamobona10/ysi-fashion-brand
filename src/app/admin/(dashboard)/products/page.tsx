"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { formatPrice, cn } from "@/lib/utils"
import { DataTable, type Column } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit } from "lucide-react"
import { deleteProductWithImages } from "@/actions"
import { useToast } from "@/components/ui/toast"

interface ProductRow {
  id: string
  name: string
  slug: string
  sku: string
  status: string
  category: string
  gender: string
  price: number
  originalPrice?: number
  description: string
  images: string[]
  fabric: string
  colors: string[]
  sizes: string[]
  inStock: boolean
  stockQty: number
  rating: number
  reviewCount: number
  isNew?: boolean
  isBestseller?: boolean
  season?: string
  occasion?: string
  style?: string
  tailoringNotes?: string
  deliveryEstimate?: string
}

async function fetchProducts(): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return (data as Record<string, unknown>[]) || []
  } catch {
    return []
  }
}

function mapProduct(raw: Record<string, unknown>): ProductRow {
  return {
    id: String(raw.id || ""),
    name: String(raw.name || ""),
    slug: String(raw.slug || ""),
    sku: String(raw.sku || ""),
    status: String(raw.status || "active"),
    category: String(raw.category || ""),
    gender: String(raw.gender || "unisex"),
    price: Number(raw.price || 0),
    originalPrice: raw.original_price ? Number(raw.original_price) : raw.originalPrice ? Number(raw.originalPrice) : undefined,
    description: String(raw.description || ""),
    images: Array.isArray(raw.images) ? raw.images as string[] : raw.image ? [String(raw.image)] : [],
    fabric: String(raw.fabric || ""),
    colors: Array.isArray(raw.colors) ? raw.colors as string[] : typeof raw.colors === "string" ? JSON.parse(raw.colors as string) : [],
    sizes: Array.isArray(raw.sizes) ? raw.sizes as string[] : typeof raw.sizes === "string" ? JSON.parse(raw.sizes as string) : [],
    inStock: raw.in_stock !== undefined ? Boolean(raw.in_stock) : raw.inStock !== undefined ? Boolean(raw.inStock) : true,
    stockQty: Number(raw.stock_qty) || 0,
    rating: Number(raw.rating || raw.average_rating || 0),
    reviewCount: Number(raw.review_count || raw.reviewCount || 0),
    isNew: raw.is_new !== undefined ? Boolean(raw.is_new) : raw.isNew !== undefined ? Boolean(raw.isNew) : undefined,
    isBestseller: raw.is_bestseller !== undefined ? Boolean(raw.is_bestseller) : raw.isBestseller !== undefined ? Boolean(raw.isBestseller) : undefined,
    season: raw.season ? String(raw.season) : undefined,
    occasion: raw.occasion ? String(raw.occasion) : undefined,
    style: raw.style ? String(raw.style) : undefined,
    tailoringNotes: raw.tailoring_notes ? String(raw.tailoring_notes) : raw.tailoringNotes ? String(raw.tailoringNotes) : undefined,
    deliveryEstimate: raw.delivery_estimate ? String(raw.delivery_estimate) : raw.deliveryEstimate ? String(raw.deliveryEstimate) : undefined,
  }
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [localProducts, setLocalProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts().then((data) => {
      setLocalProducts((data || []).map((p) => mapProduct(p)))
      setLoading(false)
    })
  }, [])

  const handleToggleStock = useCallback(async (id: string, currentInStock: boolean) => {
    const newInStock = !currentInStock
    setLocalProducts((prev) => prev.map((x) => (x.id === id ? { ...x, inStock: newInStock } : x)))
    const { error } = await supabase.from("products").update({ in_stock: newInStock }).eq("id", id)
    if (error) {
      toast({ title: "Failed to update stock", variant: "error" })
    } else {
      toast({ title: newInStock ? "Product back in stock" : "Product marked out of stock", variant: "success" })
    }
  }, [toast])

  const handleDelete = useCallback(async () => {
    if (!showDelete) return
    setDeleting(true)
    const result = await deleteProductWithImages(showDelete)
    if (result.error) {
      toast({ title: "Delete failed", description: result.error, variant: "error" })
      setError(result.error)
    } else {
      toast({ title: "Product deleted", variant: "success" })
      setLocalProducts((prev) => prev.filter((p) => p.id !== showDelete))
    }
    setShowDelete(null)
    setDeleting(false)
  }, [showDelete])

  const columns: Column<ProductRow>[] = useMemo(
    () => [
      {
        key: "image",
        header: "",
        render: (p) => (
          <img src={p.images[0]} alt={p.name} className="w-12 h-16 object-cover" />
        ),
      },
      {
        key: "name",
        header: "Product",
        sortable: true,
        render: (p) => (
          <div>
            <p className="font-medium text-jet">{p.name}</p>
            <p className="text-[10px] text-jet/40">{p.fabric}</p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        sortable: true,
        className: "hidden lg:table-cell",
      },
      {
        key: "sku",
        header: "SKU",
        className: "hidden lg:table-cell",
        render: (p) => <span className="text-jet/50 text-xs font-poppins">{p.sku || "—"}</span>,
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        className: "hidden lg:table-cell",
        render: (p) => (
          <span className={cn(
            "inline-block px-2.5 py-0.5 text-[10px] font-poppins uppercase tracking-luxe",
            p.status === "active" ? "text-emerald bg-emerald/5" :
            p.status === "draft" ? "text-jet/30 bg-jet/5" :
            "text-burgundy bg-burgundy/5"
          )}>
            {p.status}
          </span>
        ),
      },
      {
        key: "gender",
        header: "Gender",
        sortable: true,
        render: (p) => (<span className="capitalize">{p.gender}</span>),
        className: "hidden lg:table-cell",
      },
      {
        key: "price",
        header: "Price",
        sortable: true,
        render: (p) => formatPrice(p.price),
      },
      {
        key: "inStock",
        header: "Stock",
        render: (p) => (
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleStock(p.id, p.inStock) }}
            className={cn(
              "px-2.5 py-1 text-[10px] font-poppins uppercase tracking-luxe border transition-colors",
              p.inStock ? "bg-emerald/10 text-emerald border-emerald/20" : "bg-burgundy/10 text-burgundy border-burgundy/20"
            )}
          >
            {p.inStock ? "In Stock" : "Out of Stock"}
          </button>
        ),
      },
      {
        key: "actions",
        header: "",
        render: (p) => (
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/products/${p.id}`) }}
              className="w-8 h-8 flex items-center justify-center text-jet/30 hover:text-jet transition-colors" title="Edit">
              <Edit size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowDelete(p.id) }}
              className="w-8 h-8 flex items-center justify-center text-jet/30 hover:text-burgundy transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    [router, handleToggleStock]
  )

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 w-40 bg-jet/5 animate-pulse" />
            <div className="h-4 w-36 bg-jet/5 animate-pulse mt-2" />
          </div>
        </div>
        <div className="bg-cream border border-jet/5 p-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-16 bg-jet/5 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-jet/5 animate-pulse" />
                  <div className="h-3 w-32 bg-jet/5 animate-pulse mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-jet">Products</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">{localProducts.length} products in your collection</p>
        </div>
        <Button onClick={() => router.push("/admin/products/new")} variant="primary" size="sm">
          <Plus size={14} /> Add Product
        </Button>
      </div>

      <div className="bg-cream border border-jet/5">
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={localProducts as unknown as Record<string, unknown>[]}
          keyExtractor={(p) => p.id as string}
          onRowClick={(p) => router.push(`/admin/products/${p.id}`)}
          searchable
          searchPlaceholder="Search products..."
          pageSize={10}
          emptyMessage="No products found"
        />
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-jet/30 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-cream p-8 max-w-sm w-full mx-4">
            <h3 className="font-display text-xl text-jet">Delete Product?</h3>
            <p className="text-jet/60 text-sm font-poppins mt-2">This action cannot be undone. The product will be permanently removed.</p>
            {error && <p className="mt-3 text-burgundy text-xs font-poppins">{error}</p>}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowDelete(null); setError("") }} disabled={deleting}>Cancel</Button>
              <Button variant="primary" size="sm" className="flex-1 bg-burgundy hover:bg-burgundy/90" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
