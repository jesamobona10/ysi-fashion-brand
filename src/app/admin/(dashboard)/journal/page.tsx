"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Pencil, Trash2, Plus, Search } from "lucide-react"

interface Article {
  id: string
  title: string
  author: string
  status: string
  created_at: string
}

export default function AdminJournalPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  useEffect(() => { fetchArticles() }, [])

  async function fetchArticles() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/articles")
      if (!res.ok) throw new Error("Failed to fetch articles")
      const data = await res.json()
      setArticles(Array.isArray(data) ? data : data.articles || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete article "${title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete article")
      setArticles((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const statusStyles: Record<string, string> = {
    draft: "bg-jet/5 text-jet/70",
    published: "text-emerald bg-emerald/5",
    archived: "text-burgundy bg-burgundy/5",
  }

  const filtered = articles.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-2xl font-playfair text-jet">Journal</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Manage blog articles and posts</p>
        </div>
        <Button onClick={() => router.push("/admin/journal/new")} variant="gold" size="sm">
          <Plus size={14} className="mr-1" /> New Article
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-burgundy/10 border border-burgundy/20 text-burgundy text-sm font-poppins">{error}</div>
      )}

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-jet/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
          placeholder="Search by title..." />
      </div>

      <div className="bg-cream border border-jet/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-jet/10 text-jet/60 text-xs uppercase tracking-wider">
              <th className="text-left py-4 px-4 font-medium">Title</th>
              <th className="text-left py-4 px-4 font-medium">Author</th>
              <th className="text-left py-4 px-4 font-medium">Status</th>
              <th className="text-left py-4 px-4 font-medium">Date</th>
              <th className="text-right py-4 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-jet/40 text-sm font-poppins">
                  No articles found
                </td>
              </tr>
            ) : (
              filtered.map((article) => (
                <tr key={article.id} className="border-b border-jet/5 hover:bg-jet/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <span className="text-jet font-medium font-poppins text-sm">{article.title}</span>
                  </td>
                  <td className="py-4 px-4 text-jet/50 text-xs font-poppins">{article.author || "—"}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-poppins capitalize ${statusStyles[article.status] || "bg-jet/5 text-jet/70"}`}>
                      {article.status || "draft"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-jet/50 text-xs font-poppins">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button onClick={() => router.push(`/admin/journal/${article.id}`)} variant="ghost" size="sm">
                        <Pencil size={13} />
                      </Button>
                      <Button onClick={() => handleDelete(article.id, article.title)} variant="ghost" size="sm" className="text-burgundy/60 hover:text-burgundy">
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
