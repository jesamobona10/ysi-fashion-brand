"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Pencil, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  is_active: boolean
  last_triggered_at: string | null
  last_error: string | null
  created_at: string
}

export default function AdminWebhooksPage() {
  const router = useRouter()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => { fetchWebhooks() }, [])

  async function fetchWebhooks() {
    setLoading(true)
    setError("")
    try {
      const { data, error: fetchErr } = await supabase
        .from("webhooks")
        .select("*")
        .order("name")
      if (fetchErr) throw fetchErr
      setWebhooks((data || []) as Webhook[])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(wh: Webhook) {
    if (!confirm(`Delete webhook "${wh.name}"? This cannot be undone.`)) return
    try {
      const { error: delErr } = await supabase.from("webhooks").delete().eq("id", wh.id)
      if (delErr) throw delErr
      setWebhooks((prev) => prev.filter((w) => w.id !== wh.id))
      toast({ title: "Webhook deleted", variant: "success" })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
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
        <div>
          <h1 className="text-2xl font-playfair text-jet">Webhooks</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Manage outgoing webhook endpoints</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchWebhooks} variant="outline" size="sm">
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button onClick={() => router.push("/admin/webhooks/new")} variant="gold" size="sm">
            <Plus size={14} className="mr-1" /> New Webhook
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-burgundy/10 border border-burgundy/20 text-burgundy text-sm font-poppins">{error}</div>
      )}

      <div className="bg-cream border border-jet/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-jet/10 text-jet/60 text-xs uppercase tracking-wider">
              <th className="text-left py-4 px-4 font-medium">Name</th>
              <th className="text-left py-4 px-4 font-medium">URL</th>
              <th className="text-left py-4 px-4 font-medium">Events</th>
              <th className="text-left py-4 px-4 font-medium">Active</th>
              <th className="text-left py-4 px-4 font-medium">Last Triggered</th>
              <th className="text-left py-4 px-4 font-medium">Last Error</th>
              <th className="text-right py-4 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-jet/40 text-sm font-poppins">
                  No webhooks yet. Create your first webhook.
                </td>
              </tr>
            ) : (
              webhooks.map((wh) => (
                <tr key={wh.id} className="border-b border-jet/5 hover:bg-jet/[0.02] transition-colors">
                  <td className="py-3 px-4 text-jet font-medium font-poppins text-sm">{wh.name}</td>
                  <td className="py-3 px-4 text-jet/50 text-xs font-poppins max-w-[200px] truncate">{wh.url}</td>
                  <td className="py-3 px-4 text-jet/50 text-xs font-poppins">
                    {wh.events?.join(", ") || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-poppins ${wh.is_active ? "text-emerald bg-emerald/5" : "text-burgundy bg-burgundy/5"}`}>
                      {wh.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-jet/50 text-xs font-poppins">
                    {wh.last_triggered_at ? new Date(wh.last_triggered_at).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 px-4 text-jet/50 text-xs font-poppins max-w-[150px] truncate">
                    {wh.last_error || "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button onClick={() => router.push(`/admin/webhooks/${wh.id}`)} variant="ghost" size="sm">
                        <Pencil size={13} />
                      </Button>
                      <Button onClick={() => handleDelete(wh)} variant="ghost" size="sm" className="text-burgundy/60 hover:text-burgundy">
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
