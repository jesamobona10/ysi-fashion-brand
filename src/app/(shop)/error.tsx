"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[shop error boundary]", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full border border-jet/5 bg-ivory p-8 text-center shadow-card">
        <div className="w-12 h-12 mx-auto rounded-full bg-gold/10 flex items-center justify-center text-gold">
          <AlertTriangle size={20} />
        </div>
        <h1 className="font-display text-3xl text-jet mt-5">This page failed to load</h1>
        <p className="text-sm text-jet/60 font-poppins mt-3">
          Something went wrong rendering this page. You can try again.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-colors"
        >
          <RefreshCcw size={14} />
          Retry
        </button>
      </div>
    </div>
  )
}
