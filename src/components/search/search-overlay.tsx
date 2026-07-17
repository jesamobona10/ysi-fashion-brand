"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, X, TrendingUp, Clock, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Suggestion {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
}

interface HistoryItem {
  query: string
  created_at: string
}

interface PopularSearch {
  query: string
  search_count: number
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [popular, setPopular] = useState<PopularSearch[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      document.body.style.overflow = "hidden"
      fetchHistory()
      fetchPopular()
    } else {
      document.body.style.overflow = ""
      setQuery("")
      setSuggestions([])
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setSuggestions([]); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=6`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch {} finally {
        setLoading(false)
      }
    }, 250)
  }, [query])

  async function fetchHistory() {
    try {
      const res = await fetch("/api/search/history")
      const data = await res.json()
      setHistory(data.history || [])
    } catch {}
  }

  async function fetchPopular() {
    try {
      const res = await fetch("/api/search/popular")
      const data = await res.json()
      setPopular(data.popular || [])
    } catch {}
  }

  async function saveHistory(searchQuery: string) {
    try {
      await fetch("/api/search/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })
    } catch {}
  }

  function handleSearch(searchQuery: string) {
    if (!searchQuery.trim()) return
    saveHistory(searchQuery.trim())
    onClose()
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch(query)
    if (e.key === "Escape") onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-jet/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto mt-24 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-cream border border-jet/10 shadow-luxury">
          <div className="flex items-center border-b border-jet/10">
            <Search size={16} className="ml-5 text-jet/30 shrink-0" />
            <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Search products, categories, fabrics..."
              className="w-full h-14 px-4 bg-transparent text-jet text-sm font-poppins focus:outline-none" />
            {loading && <Loader2 size={14} className="mr-4 text-gold animate-spin" />}
            <button onClick={onClose} className="mr-4 w-7 h-7 flex items-center justify-center text-jet/30 hover:text-jet"><X size={15} /></button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {suggestions.length > 0 ? (
              <div>
                {suggestions.map((s) => (
                  <Link key={s.id} href={`/shop/${s.slug}`} onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-jet/5 transition-colors">
                    <div className="w-10 h-13 bg-cream border border-jet/5 shrink-0">
                      <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins text-sm text-jet truncate">{s.name}</p>
                      <p className="text-[10px] font-poppins text-jet/40">{s.category}</p>
                    </div>
                    <span className="font-poppins text-sm text-jet font-medium">{formatPrice(s.price)}</span>
                  </Link>
                ))}
                <button onClick={() => handleSearch(query)}
                  className="w-full px-3 py-2.5 text-left text-xs font-poppins text-gold hover:bg-gold/5 transition-colors">
                  See all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            ) : query.length > 0 && !loading ? (
              <button onClick={() => handleSearch(query)}
                className="w-full px-3 py-6 text-center text-sm font-poppins text-jet/50 hover:text-jet transition-colors">
                Search for &ldquo;{query}&rdquo;
              </button>
            ) : (
              <div className="px-3 py-4 space-y-4">
                {history.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-[10px] font-poppins uppercase tracking-luxe text-jet/30 mb-2">
                      <Clock size={11} /> Recent Searches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {history.map((h, i) => (
                        <button key={i} onClick={() => { setQuery(h.query); handleSearch(h.query) }}
                          className="px-3 py-1.5 bg-jet/5 text-xs font-poppins text-jet/60 hover:text-jet hover:bg-jet/10 transition-colors">
                          {h.query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {popular.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-[10px] font-poppins uppercase tracking-luxe text-jet/30 mb-2">
                      <TrendingUp size={11} /> Popular Searches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {popular.map((p, i) => (
                        <button key={i} onClick={() => { setQuery(p.query); handleSearch(p.query) }}
                          className="px-3 py-1.5 bg-gold/5 text-xs font-poppins text-gold hover:bg-gold/10 transition-colors">
                          {p.query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {history.length === 0 && popular.length === 0 && (
                  <p className="text-center text-sm font-poppins text-jet/30 py-6">Type to search products</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
