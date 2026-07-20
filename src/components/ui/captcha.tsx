"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { RefreshCw, CheckCircle, Loader2 } from "lucide-react"

interface CaptchaProps {
  onVerify: (token: string) => void
  className?: string
}

function generateChallenge() {
  const ops = ["+", "\u2212"]
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a = Math.floor(Math.random() * 20) + 1
  let b = Math.floor(Math.random() * 20) + 1
  if (op === "\u2212" && a < b) [a, b] = [b, a]
  const answer = op === "+" ? a + b : a - b
  return { a, b, op, answer }
}

const SYMBOL_OP: Record<string, string> = {
  "+": "+",
  "\u2212": "-",
}

export function Captcha({ onVerify, className = "" }: CaptchaProps) {
  const [challenge, setChallenge] = useState(() => generateChallenge())
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)
  const [verified, setVerified] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const onVerifyRef = useRef(onVerify)
  onVerifyRef.current = onVerify

  useEffect(() => {
    return () => { mountedRef.current = false; if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const newChallenge = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setChallenge(generateChallenge())
    setInput("")
    setError(false)
    setVerified(false)
    setAttempts(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (verified) {
      const token = `captcha_${Date.now()}_${challenge.answer}`
      const delay = 300 + Math.random() * 400
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) onVerifyRef.current(token)
      }, delay)
    }
  }, [verified, challenge.answer])

  function handleVerify() {
    const delay = 200 + Math.random() * 600
    setLoading(true)
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      setLoading(false)
      const num = parseInt(input, 10)
      if (num === challenge.answer) {
        setVerified(true)
        setError(false)
      } else {
        setError(true)
        setAttempts((p) => p + 1)
        if (attempts >= 2) {
          newChallenge()
        } else {
          setInput("")
        }
      }
    }, delay)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setInput("")
      setError(false)
    }
  }

  if (verified) {
    return (
      <div className={`flex items-center gap-2 text-emerald text-xs font-poppins ${className}`} role="status" aria-live="polite">
        <CheckCircle size={14} aria-hidden="true" />
        <span>Security verified</span>
      </div>
    )
  }

  return (
    <div className={className} role="group" aria-label="Security verification">
      <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-2" id="captcha-label">
        Security Check: What is {challenge.a} {challenge.op} {challenge.b}?
      </label>
      <div className="flex gap-2" aria-labelledby="captcha-label">
        <input
          type="number"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); if (timerRef.current) clearTimeout(timerRef.current) }}
          onKeyDown={handleKeyDown}
          className={`w-full h-10 px-3 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${error ? "border-burgundy" : "border-jet/10"}`}
          placeholder="Answer"
          aria-label="Enter the correct answer"
          aria-describedby={error ? "captcha-error" : undefined}
          aria-invalid={error || undefined}
          disabled={loading}
          autoComplete="off"
        />
        <button type="button" onClick={handleVerify}
          className="h-10 px-4 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all shrink-0 disabled:opacity-40"
          disabled={loading || !input.trim()}
          aria-label="Verify security answer">
          {loading ? <Loader2 size={12} className="animate-spin" /> : "Verify"}
        </button>
        <button type="button" onClick={newChallenge}
          className="h-10 w-10 flex items-center justify-center border border-jet/10 text-jet/30 hover:text-jet transition-colors shrink-0 disabled:opacity-40"
          disabled={loading}
          aria-label="Generate new security challenge">
          <RefreshCw size={14} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id="captcha-error" className="text-burgundy text-[10px] font-poppins mt-1" role="alert">
          Incorrect answer.{attempts >= 2 ? " New challenge generated." : " Try again."}
        </p>
      )}
    </div>
  )
}
