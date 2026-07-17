"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react"
import { StylistForm } from "@/components/stylist/stylist-form"
import { OutfitDisplay } from "@/components/stylist/outfit-display"
import { useToast } from "@/components/ui/toast"
import { friendlyError } from "@/lib/friendly-error"
import type { StyledOutfit, StylistRequest } from "@/lib/ai/stylist"
import type { Occasion, Vibe } from "@/lib/ai/constants"

export default function StylistPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [outfits, setOutfits] = useState<StyledOutfit[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const { toast } = useToast()

  const handleGenerate = useCallback(async (data: { occasion: string; vibe: string; gender: string; description: string }) => {
    setLoading(true)
    setError("")
    setOutfits([])
    setHasGenerated(false)

    try {
      const res = await fetch("/api/stylist/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: data.occasion,
          vibe: data.vibe,
          gender: data.gender,
          description: data.description,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to generate looks")
      }

      setOutfits(result.outfits)
      setHasGenerated(true)
      toast({ title: "Looks ready!", description: `${result.outfits.length} outfits styled for you`, variant: "success" })
    } catch (err) {
      const friendly = friendlyError(err)
      setError(friendly)
      toast({ title: "Unable to style your look", description: friendly, variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles size={24} className="text-gold" />
          </div>
          <h1 className="font-display text-4xl lg:text-5xl text-jet mb-4">Style Editor</h1>
          <p className="text-jet/50 text-sm font-poppins max-w-lg mx-auto leading-relaxed">
            Tell us the occasion and your vibe. Our AI stylist will curate complete looks from the YSI collection.
          </p>
          <div className="gold-divider mt-6 mx-auto w-16" />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!hasGenerated ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <StylistForm onGenerate={handleGenerate} loading={loading} />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <OutfitDisplay outfits={outfits} />
                <div className="text-center pt-4">
                  <button onClick={() => setHasGenerated(false)}
                    className="inline-flex items-center gap-2 h-10 px-6 border border-jet/10 text-[10px] font-poppins uppercase tracking-luxe text-jet/50 hover:text-jet hover:border-jet/30 transition-all">
                    <RefreshCw size={12} />
                    Create New Look
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && !hasGenerated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-amber/5 border border-amber/20 flex items-start gap-3"
            >
              <AlertTriangle size={14} className="text-amber shrink-0 mt-0.5" />
              <p className="text-jet/70 text-xs font-poppins">{error}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
