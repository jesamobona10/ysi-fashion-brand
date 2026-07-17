"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface WebhookForm {
  name: string
  url: string
  events: string
  secret: string
  is_active: boolean
}

const defaultForm: WebhookForm = {
  name: "",
  url: "",
  events: "",
  secret: "",
  is_active: true,
}

export default function AdminWebhookEditPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "new"
  const [form, setForm] = useState<WebhookForm>(defaultForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (!isNew) {
      supabase.from("webhooks").select("*").eq("id", params.id).single().then(({ data, error: fetchErr }) => {
        if (fetchErr) {
          setError(fetchErr.message)
        } else if (data) {
          const d = data as Record<string, unknown>
          setForm({
            name: (d.name as string) || "",
            url: (d.url as string) || "",
            events: ((d.events as string[]) || []).join(", "),
            secret: (d.secret as string) || "",
            is_active: d.is_active as boolean ?? true,
          })
        }
        setLoading(false)
      })
    }
  }, [isNew, params.id])

  function update<K extends keyof WebhookForm>(key: K, value: WebhookForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setError("")
    if (!form.name.trim()) { setError("Name is required"); return }
    if (!form.url.trim()) { setError("URL is required"); return }

    setSaving(true)
    try {
      const eventsArray = form.events
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        url: form.url.trim(),
        events: eventsArray,
        secret: form.secret.trim() || null,
        is_active: form.is_active,
      }

      if (isNew) {
        const { error: insertErr } = await supabase.from("webhooks").insert(payload)
        if (insertErr) throw insertErr
        toast({ title: "Webhook created", variant: "success" })
      } else {
        const { error: updateErr } = await supabase.from("webhooks").update(payload).eq("id", params.id)
        if (updateErr) throw updateErr
        toast({ title: "Webhook updated", variant: "success" })
      }
      router.push("/admin/webhooks")
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
          <Button onClick={() => router.push("/admin/webhooks")} variant="ghost" size="sm">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-playfair text-jet">{isNew ? "New Webhook" : "Edit Webhook"}</h1>
            <p className="text-jet/50 text-sm font-poppins mt-1">
              {isNew ? "Create a new webhook endpoint" : `Editing ${form.name || "webhook"}`}
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
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">Name *</label>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="e.g. Order Notifications" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">URL *</label>
          <input type="text" value={form.url} onChange={(e) => update("url", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="https://example.com/webhook" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">
            Events <span className="text-jet/30 normal-case">(comma-separated)</span>
          </label>
          <input type="text" value={form.events} onChange={(e) => update("events", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="order.created, order.updated" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-jet/60 font-poppins mb-2">
            Secret <span className="text-jet/30 normal-case">(optional)</span>
          </label>
          <input type="text" value={form.secret} onChange={(e) => update("secret", e.target.value)}
            className="w-full h-12 px-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
            placeholder="A secret to sign payloads" />
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
