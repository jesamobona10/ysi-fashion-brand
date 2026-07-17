"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Check, X, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface Review {
  id: string
  product_id: string
  customer_id: string | null
  rating: number
  title: string | null
  body: string | null
  images: string[]
  status: string
  created_at: string
  product: { name: string; slug: string } | null
  customer: { name: string } | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<string>("pending")
  const { toast } = useToast()

  useEffect(() => { fetchReviews() }, [filter])

  async function fetchReviews() {
    setLoading(true)
    setError("")
    try {
      let query = supabase
        .from("reviews")
        .select("*, product:product_id(name, slug), customer:customer_id(name)")

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error: fetchErr } = await query
        .order("created_at", { ascending: false })
        .limit(50)

      if (fetchErr) throw fetchErr
      setReviews((data || []) as unknown as Review[])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleModerate(id: string, status: string) {
    try {
      const { error: modErr } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", id)

      if (modErr) throw modErr
      toast({ title: `Review ${status}`, variant: "success" })
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      toast({ title: "Failed to moderate", description: err instanceof Error ? err.message : String(err), variant: "error" })
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
          <h1 className="text-2xl font-playfair text-jet">Review Moderation</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Approve or reject customer reviews</p>
        </div>
        <Button onClick={fetchReviews} variant="outline" size="sm">
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-burgundy/10 border border-burgundy/20 text-burgundy text-sm font-poppins">{error}</div>
      )}

      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "px-4 h-9 text-xs font-poppins uppercase tracking-luxe transition-colors",
              filter === f ? "bg-jet text-cream" : "bg-cream text-jet/50 hover:text-jet border border-jet/10"
            )}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-jet/40 text-sm font-poppins py-12">No {filter} reviews to show</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-cream border border-jet/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "text-gold fill-gold" : "text-jet/10"} />
                      ))}
                    </div>
                    {review.product && (
                      <span className="text-[10px] font-poppins text-jet/40">{review.product.name}</span>
                    )}
                  </div>
                  {review.title && (
                    <p className="font-poppins text-sm text-jet font-medium">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="font-poppins text-sm text-jet/70 mt-1">{review.body}</p>
                  )}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-poppins text-jet/30">
                      {review.customer?.name || "Anonymous"}
                    </span>
                    <span className="text-[10px] font-poppins text-jet/20">&bull;</span>
                    <span className="text-[10px] font-poppins text-jet/30">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    <span className={cn(
                      "inline-block px-2 py-0.5 text-[10px] font-poppins",
                      review.status === "pending" ? "text-amber bg-amber/5" :
                      review.status === "approved" ? "text-emerald bg-emerald/5" : "text-burgundy bg-burgundy/5"
                    )}>
                      {review.status}
                    </span>
                  </div>
                </div>
                {review.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleModerate(review.id, "approved")}
                      className="w-9 h-9 flex items-center justify-center text-emerald bg-emerald/5 hover:bg-emerald/10 transition-colors">
                      <Check size={15} />
                    </button>
                    <button onClick={() => handleModerate(review.id, "rejected")}
                      className="w-9 h-9 flex items-center justify-center text-burgundy bg-burgundy/5 hover:bg-burgundy/10 transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
