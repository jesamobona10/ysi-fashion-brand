"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toSlug } from "@/lib/slug"
import { useToast } from "@/components/ui/toast"

interface ArticleForm {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  meta_description: string
  tags: string
  status: string
}

export default function AdminJournalEditPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "new"
  const [form, setForm] = useState<ArticleForm>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    meta_description: "",
    tags: "",
    status: "draft",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (!isNew) {
      supabase.from("articles").select("*").eq("id", params.id).maybeSingle().then(({ data }) => {
        if (data) {
          const d = data as Record<string, unknown>
          setForm({
            title: (d.title as string) || "",
            slug: (d.slug as string) || "",
            excerpt: (d.excerpt as string) || "",
            content: (d.content as string) || "",
            featured_image: (d.featured_image as string) || "",
            meta_description: (d.meta_description as string) || "",
            tags: Array.isArray(d.tags) ? (d.tags as string[]).join(", ") : (d.tags as string) || "",
            status: (d.status as string) || "draft",
          })
        }
        setLoading(false)
      })
    }
  }, [isNew, params.id])

  function update<K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setError("")
    if (!form.title.trim()) { setError("Title is required"); return }

    setSaving(true)
    try {
      const slug = form.slug.trim() || toSlug(form.title)
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        content: form.content,
        featured_image: form.featured_image.trim() || null,
        meta_description: form.meta_description.trim() || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: form.status,
      }

      if (isNew) {
        const { error: insertErr } = await supabase.from("articles").insert(payload)
        if (insertErr) throw insertErr
        toast({ title: "Article created", variant: "success" })
      } else {
        const { error: updateErr } = await supabase.from("articles").update(payload).eq("id", params.id)
        if (updateErr) throw updateErr
        toast({ title: "Article updated", variant: "success" })
      }
      router.push("/admin/journal")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast({ title: "Save failed", description: msg, variant: "error" })
      setError(msg)
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
          <Button onClick={() => router.push("/admin/journal")} variant="ghost" size="sm">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-playfair text-jet">{isNew ? "New Article" : "Edit Article"}</h1>
            <p className="text-jet/50 text-sm font-poppins mt-1">
              {isNew ? "Create a new journal entry" : `Editing ${form.title}`}
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
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Title</label>
          <input type="text" value={form.title} onChange={(e) => {
            update("title", e.target.value)
            if (isNew) update("slug", toSlug(e.target.value))
          }}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="Article title" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">
            Slug <span className="text-jet/30 normal-case">(auto-generated from title)</span>
          </label>
          <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="article-title" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Excerpt</label>
          <textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value.slice(0, 300))}
            rows={2} className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none"
            placeholder="Brief summary..." maxLength={300} />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Content</label>
          <textarea value={form.content} onChange={(e) => update("content", e.target.value)}
            rows={12} className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none"
            placeholder="Write your article content here..." />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Featured Image URL</label>
          <input type="text" value={form.featured_image} onChange={(e) => update("featured_image", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="https://..." />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Meta Description</label>
          <textarea value={form.meta_description} onChange={(e) => update("meta_description", e.target.value.slice(0, 160))}
            rows={2} className="w-full p-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none"
            placeholder="SEO meta description..." maxLength={160} />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Tags <span className="text-jet/30 normal-case">(comma-separated)</span></label>
          <input type="text" value={form.tags} onChange={(e) => update("tags", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="fashion, tailoring, style" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Status</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 capitalize">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>
  )
}
