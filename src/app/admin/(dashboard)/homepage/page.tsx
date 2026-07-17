"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCw, Pencil, Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface HomepageSection {
  id: string
  section_key: string
  title: string
  subtitle: string
  description: string
  image_url: string
  link_url: string
  link_label: string
  is_active: boolean
  sort_order: number
}

interface Banner {
  id: string
  title: string
  banner_type: string
  is_active: boolean
  sort_order: number
  start_date: string
  end_date: string
}

const emptySection: HomepageSection = {
  id: "",
  section_key: "",
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  link_url: "",
  link_label: "",
  is_active: false,
  sort_order: 0,
}

export default function AdminHomepagePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [sections, setSections] = useState<HomepageSection[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<HomepageSection>(emptySection)
  const [savingSection, setSavingSection] = useState(false)
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null)

  async function loadData() {
    try {
      const [sectionsRes, bannersRes] = await Promise.all([
        supabase.from("homepage_sections").select("*").order("sort_order"),
        supabase.from("banners").select("*").order("sort_order"),
      ])
      if (sectionsRes.error) throw sectionsRes.error
      if (bannersRes.error) throw bannersRes.error
      setSections((sectionsRes.data ?? []) as HomepageSection[])
      setBanners((bannersRes.data ?? []) as Banner[])
    } catch (err) {
      toast({ title: "Failed to load homepage data", description: String(err), variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  function startEdit(section: HomepageSection) {
    setEditingSectionId(section.id)
    setEditForm({ ...section })
  }

  function cancelEdit() {
    setEditingSectionId(null)
    setEditForm(emptySection)
  }

  async function handleSaveSection(section: HomepageSection) {
    setSavingSection(true)
    try {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          title: editForm.title,
          subtitle: editForm.subtitle,
          description: editForm.description,
          image_url: editForm.image_url,
          link_url: editForm.link_url,
          link_label: editForm.link_label,
          is_active: editForm.is_active,
        })
        .eq("id", section.id)
      if (error) throw error
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, ...editForm } : s))
      )
      setEditingSectionId(null)
      setEditForm(emptySection)
      toast({ title: "Section saved", variant: "success" })
    } catch (err) {
      toast({ title: "Failed to save section", description: String(err), variant: "error" })
    } finally {
      setSavingSection(false)
    }
  }

  async function handleToggleActive(section: HomepageSection) {
    const updated = { ...section, is_active: !section.is_active }
    try {
      const { error } = await supabase
        .from("homepage_sections")
        .update({ is_active: updated.is_active })
        .eq("id", section.id)
      if (error) throw error
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? updated : s))
      )
    } catch (err) {
      toast({ title: "Failed to toggle section", description: String(err), variant: "error" })
    }
  }

  async function handleDeleteBanner(id: string) {
    setDeletingBannerId(id)
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id)
      if (error) throw error
      setBanners((prev) => prev.filter((b) => b.id !== id))
      toast({ title: "Banner deleted", variant: "success" })
    } catch (err) {
      toast({ title: "Failed to delete banner", description: String(err), variant: "error" })
    } finally {
      setDeletingBannerId(null)
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-jet/30" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-jet">Homepage</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">
            Manage homepage sections and banners
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw
            size={14}
            className={cn(refreshing && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Homepage Sections */}
      <section className="mb-10">
        <h2 className="font-display text-xl text-jet mb-4">
          Homepage Sections
        </h2>
        <div className="bg-cream border border-jet/10 overflow-hidden">
          {sections.length === 0 ? (
            <div className="p-8 text-center text-jet/40 font-poppins text-sm">
              No sections found
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[1fr_2fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-jet/5 border-b border-jet/10 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">
                <span>Key</span>
                <span>Title</span>
                <span>Subtitle</span>
                <span>Sort</span>
                <span>Active</span>
                <span className="w-20" />
              </div>

              {sections.map((section) => (
                <div key={section.id}>
                  {/* Row */}
                  <div
                    onClick={() => startEdit(section)}
                    className="hidden md:grid grid-cols-[1fr_2fr_2fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-jet/10 cursor-pointer hover:bg-jet/[0.02] transition-colors items-center"
                  >
                    <span className="font-poppins text-xs text-jet/60 font-mono">
                      {section.section_key}
                    </span>
                    <span className="font-poppins text-sm text-jet truncate">
                      {section.title || "—"}
                    </span>
                    <span className="font-poppins text-xs text-jet/60 truncate">
                      {section.subtitle || "—"}
                    </span>
                    <span className="font-poppins text-xs text-jet/60">
                      {section.sort_order}
                    </span>
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleActive(section)
                        }}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors",
                          section.is_active
                            ? "bg-emerald border-emerald/30"
                            : "bg-jet/10 border-jet/20"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                            section.is_active ? "translate-x-4" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex gap-1 w-20" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => startEdit(section)}
                        className="h-8 w-8 flex items-center justify-center text-jet/40 hover:text-gold transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile row */}
                  <div
                    onClick={() => startEdit(section)}
                    className="md:hidden p-4 border-b border-jet/10 cursor-pointer hover:bg-jet/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono text-[10px] text-jet/40 uppercase tracking-luxe">
                          {section.section_key}
                        </span>
                        <p className="font-poppins text-sm text-jet mt-0.5">
                          {section.title || "—"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleActive(section)
                        }}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors shrink-0",
                          section.is_active
                            ? "bg-emerald border-emerald/30"
                            : "bg-jet/10 border-jet/20"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                            section.is_active ? "translate-x-4" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                    {section.subtitle && (
                      <p className="font-poppins text-xs text-jet/50 truncate">
                        {section.subtitle}
                      </p>
                    )}
                    <p className="font-poppins text-[10px] text-jet/30 mt-1">
                      Sort: {section.sort_order}
                    </p>
                  </div>

                  {/* Inline edit form */}
                  {editingSectionId === section.id && (
                    <div className="border-b border-jet/10 bg-jet/[0.02] p-6">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-1.5">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({ ...editForm, title: e.target.value })
                            }
                            className="w-full h-10 px-3 bg-ivory/50 border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-1.5">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={editForm.subtitle}
                            onChange={(e) =>
                              setEditForm({ ...editForm, subtitle: e.target.value })
                            }
                            className="w-full h-10 px-3 bg-ivory/50 border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-1.5">
                            Description
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            rows={3}
                            className="w-full px-3 py-2 bg-ivory/50 border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-1.5">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={editForm.image_url}
                            onChange={(e) =>
                              setEditForm({ ...editForm, image_url: e.target.value })
                            }
                            className="w-full h-10 px-3 bg-ivory/50 border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-1.5">
                            Link URL
                          </label>
                          <input
                            type="text"
                            value={editForm.link_url}
                            onChange={(e) =>
                              setEditForm({ ...editForm, link_url: e.target.value })
                            }
                            className="w-full h-10 px-3 bg-ivory/50 border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-1.5">
                            Link Label
                          </label>
                          <input
                            type="text"
                            value={editForm.link_label}
                            onChange={(e) =>
                              setEditForm({ ...editForm, link_label: e.target.value })
                            }
                            className="w-full h-10 px-3 bg-ivory/50 border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.is_active}
                              onChange={(e) =>
                                setEditForm({ ...editForm, is_active: e.target.checked })
                              }
                              className="w-4 h-4 accent-jet"
                            />
                            <span className="text-xs font-poppins text-jet/70">
                              Active
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveSection(section)}
                          variant="gold"
                          size="sm"
                          disabled={savingSection}
                        >
                          {savingSection ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          variant="ghost"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banners */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-jet">Banners</h2>
          <Button
            onClick={() => router.push("/admin/banners/new")}
            variant="gold"
            size="sm"
          >
            <Plus size={14} />
            New Banner
          </Button>
        </div>
        <div className="bg-cream border border-jet/10 overflow-hidden">
          {banners.length === 0 ? (
            <div className="p-8 text-center text-jet/40 font-poppins text-sm">
              No banners found
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-4 px-6 py-3 bg-jet/5 border-b border-jet/10 text-[10px] font-poppins uppercase tracking-luxe text-jet/40">
                <span>Title</span>
                <span>Type</span>
                <span>Active</span>
                <span>Dates</span>
                <span className="w-24" />
              </div>

              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-jet/10 items-center"
                >
                  <div>
                    <span className="md:hidden text-[10px] font-poppins uppercase tracking-luxe text-jet/40 block mb-0.5">
                      Title
                    </span>
                    <span className="font-poppins text-sm text-jet truncate block">
                      {banner.title || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="md:hidden text-[10px] font-poppins uppercase tracking-luxe text-jet/40 block mb-0.5">
                      Type
                    </span>
                    <span className="font-poppins text-xs text-jet/70 capitalize">
                      {banner.banner_type || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="md:hidden text-[10px] font-poppins uppercase tracking-luxe text-jet/40 block mb-0.5">
                      Active
                    </span>
                    <span
                      className={cn(
                        "inline-block text-[10px] font-poppins uppercase tracking-luxe px-2 py-0.5 border",
                        banner.is_active
                          ? "text-emerald border-emerald/30 bg-emerald/5"
                          : "text-jet/30 border-jet/10 bg-jet/5"
                      )}
                    >
                      {banner.is_active ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="md:hidden text-[10px] font-poppins uppercase tracking-luxe text-jet/40 block mb-0.5">
                      Dates
                    </span>
                    <span className="font-poppins text-xs text-jet/60">
                      {formatDate(banner.start_date)} – {formatDate(banner.end_date)}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-start md:justify-end">
                    <button
                      onClick={() => router.push(`/admin/banners/${banner.id}`)}
                      className="h-8 w-8 flex items-center justify-center text-jet/40 hover:text-gold transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this banner? This cannot be undone."
                          )
                        ) {
                          handleDeleteBanner(banner.id)
                        }
                      }}
                      disabled={deletingBannerId === banner.id}
                      className="h-8 w-8 flex items-center justify-center text-jet/40 hover:text-burgundy transition-colors disabled:opacity-50"
                    >
                      {deletingBannerId === banner.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
