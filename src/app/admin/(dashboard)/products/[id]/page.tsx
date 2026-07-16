"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react"
import { toSlug } from "@/lib/slug"
import { ALLOWED_CATEGORIES, ALLOWED_GENDERS, ALLOWED_SIZES, ALLOWED_COLORS, ALLOWED_SEASONS, ALLOWED_OCCASIONS } from "@/lib/validation"
import { useToast } from "@/components/ui/toast"

interface ProductForm {
  id?: string
  name: string
  slug: string
  category: string
  gender: string
  price: number
  originalPrice: number | null
  description: string
  images: string[]
  fabric: string
  colors: string[]
  sizes: string[]
  inStock: boolean
  stockQty: number
  lowStockThreshold: number
  isNew: boolean
  isBestseller: boolean
  season: string
  occasion: string
  style: string
  tailoringNotes: string
  deliveryEstimate: string
}

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  category: "Bespoke",
  gender: "unisex",
  price: 0,
  originalPrice: null,
  description: "",
  images: [],
  fabric: "",
  colors: [],
  sizes: [],
  inStock: true,
  stockQty: 0,
  lowStockThreshold: 5,
  isNew: false,
  isBestseller: false,
  season: "All Season",
  occasion: "Corporate",
  style: "",
  tailoringNotes: "",
  deliveryEstimate: "",
}

const categoryOptions = [...ALLOWED_CATEGORIES]
const genderOptions = [...ALLOWED_GENDERS]
const allSizes = [...ALLOWED_SIZES]
const colorOptions = [...ALLOWED_COLORS]
const seasonOptions = [...ALLOWED_SEASONS]
const occasionOptions = [...ALLOWED_OCCASIONS]

async function fetchProductById(id: string): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()
    if (error) throw error
    return data as Record<string, unknown> | null
  } catch {
    return null
  }
}

function toDBValues(form: ProductForm): Record<string, unknown> {
  return {
    name: form.name,
    slug: toSlug(form.name),
    category: form.category,
    gender: form.gender,
    price: form.price,
    original_price: form.originalPrice || null,
    description: form.description,
    images: form.images,
    fabric: form.fabric,
    colors: form.colors,
    sizes: form.sizes,
    in_stock: form.inStock,
    stock_qty: form.stockQty,
    low_stock_threshold: form.lowStockThreshold,
    is_new: form.isNew,
    is_bestseller: form.isBestseller,
    season: form.season || null,
    occasion: form.occasion || null,
    style: form.style || null,
    tailoring_notes: form.tailoringNotes || null,
    delivery_estimate: form.deliveryEstimate || null,
  }
}

function fromDBValues(raw: Record<string, unknown>): ProductForm {
  return {
    id: raw.id as string,
    name: (raw.name as string) || "",
    slug: (raw.slug as string) || "",
    category: (raw.category as string) || "Bespoke",
    gender: (raw.gender as string) || "unisex",
    price: Number(raw.price) || 0,
    originalPrice: raw.original_price ? Number(raw.original_price) : null,
    description: (raw.description as string) || "",
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    fabric: (raw.fabric as string) || "",
    colors: Array.isArray(raw.colors) ? (raw.colors as string[]) : [],
    sizes: Array.isArray(raw.sizes) ? (raw.sizes as string[]) : [],
    inStock: raw.in_stock !== undefined ? Boolean(raw.in_stock) : true,
    stockQty: Number(raw.stock_qty) || 0,
    lowStockThreshold: Number(raw.low_stock_threshold) || 5,
    isNew: Boolean(raw.is_new),
    isBestseller: Boolean(raw.is_bestseller),
    season: (raw.season as string) || "All Season",
    occasion: (raw.occasion as string) || "Corporate",
    style: (raw.style as string) || "",
    tailoringNotes: (raw.tailoring_notes as string) || "",
    deliveryEstimate: (raw.delivery_estimate as string) || "",
  }
}

export default function AdminProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "new"
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isNew) {
      fetchProductById(params.id as string).then((found) => {
        if (found) setForm(fromDBValues(found))
        setLoading(false)
      })
    }
  }, [isNew, params.id])

  const update = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArray = (key: "colors" | "sizes", value: string) => {
    const arr = form[key]
    update(key, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value])
  }

  const uploadToStorage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg"
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = `products/${safeName}`
    const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file)
    if (uploadError) throw uploadError
    toast({ title: "Image uploaded", variant: "success" })
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(filePath)
    return publicUrl
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setSaving(true)
    try {
      const publicUrl = await uploadToStorage(file)
      update("images", [...form.images, publicUrl])
      toast({ title: "Image uploaded", variant: "success" })
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : String(err), variant: "error" })
      setError(`Image upload failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeImage = async (index: number) => {
    const url = form.images[index]
    if (url?.includes("supabase.co/storage/v1/object/public/product-images/")) {
      const path = url.split("product-images/")[1].split("?")[0]
      const { error: removeError } = await supabase.storage.from("product-images").remove([path])
      if (removeError) {
        toast({ title: "Failed to remove image", variant: "error" })
        return
      }
    }
    update("images", form.images.filter((_, i) => i !== index))
    toast({ title: "Image removed", variant: "success" })
  }

  const handleSave = async () => {
    const validationErrors: string[] = []
    if (!form.name.trim()) validationErrors.push("Product name is required")
    else if (form.name.trim().length > 200) validationErrors.push("Product name must be under 200 characters")
    if (!form.price || form.price < 0) validationErrors.push("A valid price is required")
    if (form.price > 99999999.99) validationErrors.push("Price must be under ₦99,999,999.99")
    if (form.description && form.description.length > 5000) validationErrors.push("Description must be under 5000 characters")
    if (form.stockQty < 0 || !Number.isInteger(form.stockQty)) validationErrors.push("Stock quantity must be a non-negative integer")
    if (form.lowStockThreshold < 1 || !Number.isInteger(form.lowStockThreshold)) validationErrors.push("Low stock threshold must be a positive integer")
    if (form.tailoringNotes && form.tailoringNotes.length > 2000) validationErrors.push("Tailoring notes must be under 2000 characters")
    if (form.deliveryEstimate && form.deliveryEstimate.length > 200) validationErrors.push("Delivery estimate must be under 200 characters")

    if (validationErrors.length > 0) {
      setError(validationErrors.join("; "))
      return
    }

    setSaving(true)
    setError("")
    try {
      let slug = toSlug(form.name)

      if (isNew) {
        const { data: existing } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle()
        if (existing) {
          slug = `${slug}-${Date.now().toString(36)}`
        }
      }

      const dbValues = { ...toDBValues(form), slug }

      if (isNew) {
        const { error: insertError } = await supabase.from("products").insert(dbValues)
        if (insertError) throw insertError
      } else if (form.id) {
        const { error: updateError } = await supabase.from("products").update(dbValues).eq("id", form.id)
        if (updateError) throw updateError
      }

      toast({ title: isNew ? "Product created" : "Product updated", variant: "success" })
      setSaved(true)
      setTimeout(() => router.push("/admin/products"), 1500)
    } catch (err) {
      const msg = (err as { message?: string })?.message || "An unexpected error occurred"
      toast({ title: "Save failed", description: msg, variant: "error" })
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/admin/products")} className="w-9 h-9 rounded-lg border border-jet/10 flex items-center justify-center text-jet/40 hover:text-jet transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-jet">{isNew ? "New Product" : "Edit Product"}</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">{isNew ? "Add a new piece to your collection" : `Editing ${form.name || ""}`}</p>
        </div>
        <Button onClick={handleSave} variant="gold" size="sm" disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-burgundy/10 border border-burgundy/20 text-burgundy text-sm font-poppins">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Section label="Product Name">
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value.slice(0, 200))}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
              placeholder="e.g. The Executive Tailored Blazer" maxLength={200} />
          </Section>

          <Section label="Description">
            <textarea value={form.description} onChange={(e) => update("description", e.target.value.slice(0, 5000))}
              rows={4} className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none"
              placeholder="Product description..." maxLength={5000} />
          </Section>

          <div className="grid grid-cols-3 gap-4">
            <Section label="Category">
              <select value={form.category} onChange={(e) => update("category", e.target.value)}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50">
                {categoryOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </Section>
            <Section label="Gender">
              <select value={form.gender} onChange={(e) => update("gender", e.target.value)}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50">
                {genderOptions.map((g) => (<option key={g} value={g} className="capitalize">{g}</option>))}
              </select>
            </Section>
            <Section label="Price (₦)">
              <input type="number" value={form.price || ""} onChange={(e) => update("price", Number(e.target.value))}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
            </Section>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Section label="Original Price (₦) — optional, for showing discount">
              <input type="number" value={form.originalPrice || ""} onChange={(e) => update("originalPrice", e.target.value ? Number(e.target.value) : null)}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
            </Section>
            <Section label="Fabric">
              <input type="text" value={form.fabric} onChange={(e) => update("fabric", e.target.value)}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
                placeholder="e.g. Italian Wool Blend" />
            </Section>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Section label="Stock Quantity">
              <input type="number" value={form.stockQty} onChange={(e) => update("stockQty", Number(e.target.value))} min={0}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
            </Section>
            <Section label="Low Stock Threshold">
              <input type="number" value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", Number(e.target.value))} min={1}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
            </Section>
          </div>

          <Section label={`Colors (${form.colors.length} selected)`}>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => (
                <button key={c} onClick={() => toggleArray("colors", c)}
                  className={cn("h-9 px-3 text-[10px] font-poppins uppercase tracking-luxe border transition-all",
                    form.colors.includes(c) ? "bg-jet text-cream border-jet" : "border-jet/10 text-jet/50 hover:border-jet/30")}>
                  {c}
                </button>
              ))}
            </div>
          </Section>

          <Section label={`Sizes (${form.sizes.length} selected)`}>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((s) => (
                <button key={s} onClick={() => toggleArray("sizes", s)}
                  className={cn("w-10 h-10 text-xs font-poppins border transition-all",
                    form.sizes.includes(s) ? "bg-jet text-cream border-jet" : "border-jet/10 text-jet/50 hover:border-jet/30")}>
                  {s}
                </button>
              ))}
            </div>
          </Section>

          <div className="grid grid-cols-3 gap-4">
            <Section label="Season">
              <select value={form.season} onChange={(e) => update("season", e.target.value)}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50">
                {seasonOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </Section>
            <Section label="Occasion">
              <select value={form.occasion} onChange={(e) => update("occasion", e.target.value)}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50">
                {occasionOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </Section>
            <Section label="Style">
              <input type="text" value={form.style} onChange={(e) => update("style", e.target.value)}
                className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
                placeholder="e.g. Classic, Modern" />
            </Section>
          </div>

          <Section label="Tailoring Notes">
            <textarea value={form.tailoringNotes} onChange={(e) => update("tailoringNotes", e.target.value.slice(0, 2000))}
              rows={3} className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none"
              placeholder="e.g. Fully canvassed construction, hand-stitched lapels." maxLength={2000} />
          </Section>

          <Section label="Delivery Estimate">
            <input type="text" value={form.deliveryEstimate} onChange={(e) => update("deliveryEstimate", e.target.value.slice(0, 200))}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
              placeholder="e.g. 14-21 business days" maxLength={200} />
          </Section>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => update("inStock", !form.inStock)}
                className={cn("px-4 py-2 text-[10px] font-poppins uppercase tracking-luxe border transition-all",
                  form.inStock ? "bg-emerald/10 text-emerald border-emerald/20" : "bg-burgundy/10 text-burgundy border-burgundy/20")}>
                {form.inStock ? "In Stock" : "Out of Stock"}
              </button>
              <span className="text-xs text-jet/40 font-poppins">Click to toggle</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => update("isNew", !form.isNew)}
                className={cn("px-4 py-2 text-[10px] font-poppins uppercase tracking-luxe border transition-all",
                  form.isNew ? "bg-gold/20 text-gold border-gold/30" : "border-jet/10 text-jet/50")}>
                {form.isNew ? "New Arrival ✓" : "New Arrival"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => update("isBestseller", !form.isBestseller)}
                className={cn("px-4 py-2 text-[10px] font-poppins uppercase tracking-luxe border transition-all",
                  form.isBestseller ? "bg-jet text-cream border-jet" : "border-jet/10 text-jet/50")}>
                {form.isBestseller ? "Bestseller ✓" : "Bestseller"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Section label="Product Images">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
            <div className="space-y-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-[3/4] bg-ivory border border-jet/5 overflow-hidden group">
                  <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-burgundy text-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[3/4] border-2 border-dashed border-jet/10 flex flex-col items-center justify-center gap-2 text-jet/40 hover:text-jet hover:border-jet/30 transition-all">
                <Upload size={20} /><span className="text-[10px] font-poppins uppercase tracking-luxe">Upload Image</span>
              </button>
            </div>
            <p className="text-[10px] text-jet/30 font-poppins mt-2">Recommended: 1200x1600px, JPG or WebP</p>
          </Section>

          <Section label="Preview">
            <div className="space-y-2 text-sm font-poppins">
              <p className="text-jet font-medium">{form.name || "Product Name"}</p>
              <p className="text-gold text-xs">{form.category}</p>
              <p className="text-jet font-medium">{formatPrice(form.price || 0)}</p>
              {form.fabric && <p className="text-jet/50 text-xs">{form.fabric}</p>}
              {form.stockQty > 0 && <p className="text-emerald text-xs">{form.stockQty} in stock</p>}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-2">{label}</label>
      {children}
    </div>
  )
}
