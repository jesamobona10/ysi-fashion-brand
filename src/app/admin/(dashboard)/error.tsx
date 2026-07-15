"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin dashboard] error boundary:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full border border-burgundy/10 bg-burgundy/5 p-8 text-center shadow-card">
        <div className="w-12 h-12 mx-auto rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy">
          <AlertTriangle size={20} />
        </div>
        <h1 className="font-display text-3xl text-jet mt-5">Dashboard failed to load</h1>
        <p className="text-sm text-jet/60 font-poppins mt-3">
          Something in the admin dashboard rendering path threw an error. You can retry now without leaving the page.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-colors"
        >
          <RefreshCcw size={14} />
          Retry Dashboard
        </button>
      </div>
    </div>
  )
}