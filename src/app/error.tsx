"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global error boundary]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center border border-jet/5 bg-ivory p-8 shadow-card">
        <div className="w-12 h-12 mx-auto rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy">
          <AlertTriangle size={20} />
        </div>
        <h1 className="font-display text-3xl text-jet mt-5">Something went wrong</h1>
        <p className="text-sm text-jet/50 font-poppins mt-3">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-colors"
        >
          <RefreshCcw size={14} />
          Try again
        </button>
      </div>
    </div>
  )
}
