"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Pencil, Trash2, RefreshCw } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  sort_order: number
  created_at: string
  parent: { name: string } | null
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    setLoading(true)
    setError("")
    try {
      const { data, error: fetchErr } = await supabase
        .from("categories")
        .select("*, parent:parent_id(name)")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
      if (fetchErr) throw fetchErr
      setCategories((data || []) as unknown as Category[])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return
    try {
      const { error: delErr } = await supabase.from("categories").delete().eq("id", cat.id)
      if (delErr) throw delErr
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  type TreeNode = Category & { children: TreeNode[] }
  function buildTree(items: Category[]): TreeNode[] {
    const map = new Map<string, TreeNode>()
    const roots: TreeNode[] = []
    items.forEach((item) => map.set(item.id, { ...item, children: [] }))
    items.forEach((item) => {
      const node = map.get(item.id)!
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id)!.children.push(node)
      } else {
        roots.push(node)
      }
    })
    return roots
  }

  function renderTree(nodes: TreeNode[], depth = 0): React.ReactNode[] {
    const rows: React.ReactNode[] = []
    for (const cat of nodes) {
      rows.push(
        <tr key={cat.id} className="border-b border-jet/5 hover:bg-jet/[0.02] transition-colors">
          <td className="py-3 px-4">
            <div style={{ paddingLeft: `${depth * 20}px` }} className="flex items-center gap-2">
              {depth > 0 && <span className="text-jet/20 text-xs">└─</span>}
              <span className="text-jet font-medium font-poppins text-sm">{cat.name}</span>
              {cat.children.length > 0 && (
                <span className="text-jet/30 text-xs">({cat.children.length} sub)</span>
              )}
            </div>
          </td>
          <td className="py-3 px-4 text-jet/50 text-xs font-poppins">{cat.slug}</td>
          <td className="py-3 px-4 text-jet/50 text-xs font-poppins max-w-[200px] truncate">
            {cat.description || "—"}
          </td>
          <td className="py-3 px-4 text-jet/50 text-xs font-poppins">{cat.sort_order}</td>
          <td className="py-3 px-4 text-right">
            <div className="flex items-center justify-end gap-1">
              <Button onClick={() => router.push(`/admin/categories/${cat.id}`)} variant="ghost" size="sm">
                <Pencil size={13} />
              </Button>
              <Button onClick={() => handleDelete(cat)} variant="ghost" size="sm" className="text-burgundy/60 hover:text-burgundy">
                <Trash2 size={13} />
              </Button>
            </div>
          </td>
        </tr>
      )
      if (cat.children.length > 0) {
        rows.push(...renderTree(cat.children, depth + 1))
      }
    }
    return rows
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  const tree = buildTree(categories)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-playfair text-jet">Categories</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Organise products into nested categories</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchCategories} variant="outline" size="sm">
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button onClick={() => router.push("/admin/categories/new")} variant="gold" size="sm">
            <Plus size={14} className="mr-1" /> New Category
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
              <th className="text-left py-4 px-4 font-medium">Slug</th>
              <th className="text-left py-4 px-4 font-medium">Description</th>
              <th className="text-left py-4 px-4 font-medium">Order</th>
              <th className="text-right py-4 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-jet/40 text-sm font-poppins">
                  No categories yet. Create your first category.
                </td>
              </tr>
            ) : (
              renderTree(tree)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
