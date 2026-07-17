"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-cream text-jet" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="text-center max-w-md px-6" role="alert">
          <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-jet mb-3" style={{ fontFamily: "Georgia, serif" }}>Critical Error</h1>
          <p className="text-jet/50 text-sm mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
            {error.digest ? `Error reference: ${error.digest}` : "A critical error occurred. Please try again."}
          </p>
          <button
            onClick={reset}
            className="h-11 px-8 bg-jet text-cream text-[10px] uppercase tracking-widest hover:bg-gold hover:text-jet transition-all"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  )
}
