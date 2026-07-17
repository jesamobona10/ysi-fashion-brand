"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2 } from "lucide-react"
import { OCCASIONS, VIBES, type Occasion, type Vibe } from "@/lib/ai/constants"

interface StylistFormProps {
  onGenerate: (data: { occasion: Occasion; vibe: Vibe; gender: string; description: string }) => void
  loading: boolean
}

export function StylistForm({ onGenerate, loading }: StylistFormProps) {
  const [occasion, setOccasion] = useState<Occasion | "">("")
  const [vibe, setVibe] = useState<Vibe | "">("")
  const [gender, setGender] = useState("men")
  const [description, setDescription] = useState("")

  const canSubmit = occasion && vibe && !loading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onGenerate({ occasion: occasion as Occasion, vibe: vibe as Vibe, gender, description })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-4">What&apos;s the occasion?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {OCCASIONS.map((o) => (
            <button key={o.value} type="button" onClick={() => setOccasion(o.value)}
              className={`p-4 border text-left transition-all ${occasion === o.value ? "border-gold bg-gold/5" : "border-jet/10 hover:border-jet/30"}`}>
              <span className="text-lg block mb-1">{o.icon}</span>
              <span className="block font-poppins text-xs text-jet font-medium">{o.label}</span>
              <span className="block text-[9px] font-poppins text-jet/40 mt-1 leading-tight">{o.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-4">Pick your vibe</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {VIBES.map((v) => (
            <button key={v.value} type="button" onClick={() => setVibe(v.value)}
              className={`p-4 border text-left transition-all ${vibe === v.value ? "border-gold bg-gold/5" : "border-jet/10 hover:border-jet/30"}`}>
              <span className="block font-poppins text-xs text-jet font-medium">{v.label}</span>
              <span className="block text-[9px] font-poppins text-jet/40 mt-1 leading-tight">{v.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-2">Gender</label>
          <div className="flex gap-2">
            {["men", "women", "both"].map((g) => (
              <button key={g} type="button" onClick={() => setGender(g)}
                className={`flex-1 h-10 text-[10px] font-poppins uppercase tracking-luxe border transition-all ${gender === g ? "border-gold bg-gold/5 text-jet" : "border-jet/10 text-jet/40 hover:text-jet"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-2">
          Describe your look (optional)
        </label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 300))}
          placeholder="e.g. I want something with a fitted blazer and wide-leg trousers in neutral tones..."
          className="w-full h-20 px-4 py-3 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 resize-none" />
      </div>

      <button type="submit" disabled={!canSubmit}
        className="w-full h-14 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe flex items-center justify-center gap-3 hover:bg-gold hover:text-jet transition-all duration-300 disabled:opacity-40">
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Crafting Your Look...</>
        ) : (
          <><Sparkles size={16} /> Generate My Look</>
        )}
      </button>
    </form>
  )
}
