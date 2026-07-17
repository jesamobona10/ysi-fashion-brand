"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface BannerForm {
  title: string
  subtitle: string
  image_url: string
  link_url: string
  link_label: string
  banner_type: string
  background_color: string
  text_color: string
  sort_order: number
  is_active: boolean
  starts_at: string
  ends_at: string
}

const defaultForm: BannerForm = {
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "",
  link_label: "Shop Now",
  banner_type: "hero",
  background_color: "#1a1a1a",
  text_color: "#f5f0eb",
  sort_order: 0,
  is_active: true,
  starts_at: "",
  ends_at: "",
}

export default function AdminBannerEditPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "new"
  const [form, setForm] = useState<BannerForm>(defaultForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (!isNew) {
      supabase.from("banners").select("*").eq("id", params.id).single().then(({ data, error: fetchErr }) => {
        if (fetchErr) {
          setError(fetchErr.message)
        } else if (data) {
          const d = data as Record<string, unknown>
          setForm({
            title: (d.title as string) || "",
            subtitle: (d.subtitle as string) || "",
            image_url: (d.image_url as string) || "",
            link_url: (d.link_url as string) || "",
            link_label: (d.link_label as string) || "Shop Now",
            banner_type: (d.banner_type as string) || "hero",
            background_color: (d.background_color as string) || "#1a1a1a",
            text_color: (d.text_color as string) || "#f5f0eb",
            sort_order: Number(d.sort_order) || 0,
            is_active: d.is_active as boolean ?? true,
            starts_at: (d.starts_at as string) || (d.start_date as string) || "",
            ends_at: (d.ends_at as string) || (d.end_date as string) || "",
          })
        }
        setLoading(false)
      })
    }
  }, [isNew, params.id])

  function update<K extends keyof BannerForm>(key: K, value: BannerForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setError("")
    if (!form.title.trim()) { setError("Title is required"); return }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        image_url: form.image_url.trim() || null,
        link_url: form.link_url.trim() || null,
        link_label: form.link_label.trim() || "Shop Now",
        banner_type: form.banner_type,
        background_color: form.background_color || "#1a1a1a",
        text_color: form.text_color || "#f5f0eb",
        sort_order: form.sort_order,
        is_active: form.is_active,
        start_date: form.starts_at || null,
        end_date: form.ends_at || null,
      }

      if (isNew) {
        const { error: insertErr } = await supabase.from("banners").insert(payload)
        if (insertErr) throw insertErr
        toast({ title: "Banner created", variant: "success" })
      } else {
        const { error: updateErr } = await supabase.from("banners").update(payload).eq("id", params.id)
        if (updateErr) throw updateErr
        toast({ title: "Banner updated", variant: "success" })
      }
      router.push("/admin/homepage")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push("/admin/homepage")} variant="ghost" size="sm">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-playfair text-jet">{isNew ? "New Banner" : "Edit Banner"}</h1>
            <p className="text-jet/50 text-sm font-poppins mt-1">
              {isNew ? "Create a new homepage banner" : `Editing ${form.title || "banner"}`}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} variant="gold" size="sm" disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-burgundy/10 border border-burgundy/20 text-burgundy text-sm font-poppins">{error}</div>
      )}

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Title *</label>
          <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="Summer Sale" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Subtitle</label>
          <input type="text" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="Up to 50% off select items" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Image URL</label>
          <input type="text" value={form.image_url} onChange={(e) => update("image_url", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="https://..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Link URL</label>
            <input type="text" value={form.link_url} onChange={(e) => update("link_url", e.target.value)}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
              placeholder="/collections/sale" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Link Label</label>
            <input type="text" value={form.link_label} onChange={(e) => update("link_label", e.target.value)}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
              placeholder="Shop Now" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Banner Type</label>
            <select value={form.banner_type} onChange={(e) => update("banner_type", e.target.value)}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50">
              <option value="hero">Hero</option>
              <option value="promo">Promo</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Background Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.background_color} onChange={(e) => update("background_color", e.target.value)}
                className="h-12 w-12 p-1 bg-cream border border-jet/10 cursor-pointer" />
              <input type="text" value={form.background_color} onChange={(e) => update("background_color", e.target.value)}
                className="flex-1 h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
                placeholder="#1a1a1a" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Text Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.text_color} onChange={(e) => update("text_color", e.target.value)}
                className="h-12 w-12 p-1 bg-cream border border-jet/10 cursor-pointer" />
              <input type="text" value={form.text_color} onChange={(e) => update("text_color", e.target.value)}
                className="flex-1 h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
                placeholder="#f5f0eb" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Starts At</label>
            <input type="datetime-local" value={form.starts_at} onChange={(e) => update("starts_at", e.target.value)}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Ends At</label>
            <input type="datetime-local" value={form.ends_at} onChange={(e) => update("ends_at", e.target.value)}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)}
            className="w-4 h-4 accent-jet" />
          <label htmlFor="is_active" className="text-xs uppercase tracking-wider text-jet/60 font-poppins cursor-pointer">Active</label>
        </div>
      </div>
    </div>
  )
}
