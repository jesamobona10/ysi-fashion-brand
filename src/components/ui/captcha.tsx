"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw } from "lucide-react"

interface CaptchaProps {
  onVerify: (token: string) => void
  className?: string
}

function generateChallenge(): { a: number; b: number; op: string; answer: number } {
  const ops = ["+", "-"]
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a = Math.floor(Math.random() * 20) + 1
  let b = Math.floor(Math.random() * 20) + 1
  if (op === "-" && a < b) [a, b] = [b, a]
  const answer = op === "+" ? a + b : a - b
  return { a, b, op, answer }
}

export function Captcha({ onVerify, className = "" }: CaptchaProps) {
  const [challenge, setChallenge] = useState(() => generateChallenge())
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)
  const [verified, setVerified] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const newChallenge = useCallback(() => {
    setChallenge(generateChallenge())
    setInput("")
    setError(false)
    setVerified(false)
    setAttempts(0)
  }, [])

  useEffect(() => {
    if (verified) {
      const token = `captcha_${Date.now()}_${challenge.answer}`
      onVerify(token)
    }
  }, [verified, challenge.answer, onVerify])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(input, 10)
    if (num === challenge.answer) {
      setVerified(true)
      setError(false)
    } else {
      setError(true)
      setAttempts((p) => p + 1)
      if (attempts >= 2) {
        newChallenge()
      }
      setInput("")
    }
  }

  if (verified) {
    return (
      <div className={`flex items-center gap-2 text-emerald text-xs font-poppins ${className}`}>
        <span>✓ Verified</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-2">
        Security Check: What is {challenge.a} {challenge.op} {challenge.b}?
      </label>
      <div className="flex gap-2">
        <input type="number" value={input} onChange={(e) => { setInput(e.target.value); setError(false) }}
          className={`w-full h-10 px-3 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${error ? "border-burgundy" : "border-jet/10"}`}
          placeholder="Answer" required aria-label="Security check answer" />
        <button type="submit"
          className="h-10 px-4 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all shrink-0">
          Verify
        </button>
        <button type="button" onClick={newChallenge}
          className="h-10 w-10 flex items-center justify-center border border-jet/10 text-jet/30 hover:text-jet transition-colors shrink-0"
          aria-label="New challenge">
          <RefreshCw size={14} />
        </button>
      </div>
      {error && <p className="text-burgundy text-[10px] font-poppins mt-1">Incorrect answer. Try again.</p>}
    </form>
  )
}
