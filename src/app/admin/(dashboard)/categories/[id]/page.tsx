"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toSlug } from "@/lib/slug"
import { useToast } from "@/components/ui/toast"

interface CategoryForm {
  name: string
  slug: string
  description: string
  parent_id: string | ""
  sort_order: number
}

export default function AdminCategoryEditPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "new"
  const [parents, setParents] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState<CategoryForm>({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    sort_order: 0,
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => {
      setParents((data || []).filter((p) => isNew || p.id !== params.id) as { id: string; name: string }[])
    })
    if (!isNew) {
      supabase.from("categories").select("*").eq("id", params.id).maybeSingle().then(({ data }) => {
        if (data) {
          setForm({
            name: (data as Record<string, unknown>).name as string || "",
            slug: (data as Record<string, unknown>).slug as string || "",
            description: ((data as Record<string, unknown>).description as string) || "",
            parent_id: ((data as Record<string, unknown>).parent_id as string) || "",
            sort_order: Number((data as Record<string, unknown>).sort_order) || 0,
          })
        }
        setLoading(false)
      })
    }
  }, [isNew, params.id])

  function update<K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setError("")
    if (!form.name.trim()) { setError("Category name is required"); return }
    if (form.name.length > 100) { setError("Name must be under 100 characters"); return }
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) { setError("Slug must be lowercase alphanumeric with hyphens"); return }

    setSaving(true)
    try {
      const slug = form.slug.trim() || toSlug(form.name)
      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description.trim() || null,
        parent_id: form.parent_id || null,
        sort_order: form.sort_order,
      }

      if (isNew) {
        const { error: insertErr } = await supabase.from("categories").insert(payload)
        if (insertErr) throw insertErr
        toast({ title: "Category created", variant: "success" })
      } else {
        const { error: updateErr } = await supabase.from("categories").update(payload).eq("id", params.id)
        if (updateErr) throw updateErr
        toast({ title: "Category updated", variant: "success" })
      }
      router.push("/admin/categories")
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
          <Button onClick={() => router.push("/admin/categories")} variant="ghost" size="sm">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-playfair text-jet">{isNew ? "New Category" : "Edit Category"}</h1>
            <p className="text-jet/50 text-sm font-poppins mt-1">
              {isNew ? "Create a new product category" : `Editing ${form.name}`}
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
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Name</label>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value.slice(0, 100))}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="e.g. Ready-to-Wear" maxLength={100} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">
              Slug <span className="text-jet/30 normal-case">(auto-generated if empty)</span>
            </label>
            <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
              placeholder="ready-to-wear" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))}
              className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50" />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Parent Category</label>
          <select value={form.parent_id} onChange={(e) => update("parent_id", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50">
            <option value="">— Top Level —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value.slice(0, 500))}
            rows={3} className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none"
            placeholder="Optional description..." maxLength={500} />
        </div>
      </div>
    </div>
  )
}
