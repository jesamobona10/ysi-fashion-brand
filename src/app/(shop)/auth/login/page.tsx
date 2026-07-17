"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, AlertTriangle, Chrome } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { isValidEmail } from "@/lib/validation"
import { friendlyError } from "@/lib/friendly-error"
import { useToast } from "@/components/ui/toast"

export default function LoginPage() {
  const { login, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" })
  const { toast } = useToast()

  const validate = (): boolean => {
    const errors = { email: "", password: "" }
    let valid = true

    if (!email.trim()) { errors.email = "Email is required"; valid = false }
    else if (!isValidEmail(email)) { errors.email = "Please enter a valid email"; valid = false }

    if (!password) { errors.password = "Password is required"; valid = false }
    else if (password.length < 6) { errors.password = "Password must be at least 6 characters"; valid = false }

    setFieldErrors(errors)
    return valid
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    await signInWithGoogle()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validate()) return
    setSubmitting(true)
    try {
      const lockRes = await fetch("/api/auth/lockout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const lockData = await lockRes.json()
      if (lockData.locked) {
        setError(`Account temporarily locked. Try again in ${lockData.remainingMinutes || 15} minutes.`)
        setSubmitting(false)
        return
      }
    } catch {}
    const result = await login(email, password)
    setSubmitting(false)
    if (result.ok) {
      fetch("/api/auth/lockout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, success: true }),
      }).catch(() => {})
      toast({ title: "Welcome back!", variant: "success" })
      router.push("/account")
    } else {
      fetch("/api/auth/lockout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, success: false }),
      }).catch(() => {})
      const friendly = friendlyError(result.error || "Invalid email or password")
      toast({ title: "Unable to sign in", description: friendly, variant: "error" })
      setError(friendly)
    }
  }

  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-jet">Welcome Back</h1>
          <p className="text-jet/50 text-sm font-poppins mt-2">Sign in to your YSI account</p>
          <div className="gold-divider mt-6 mx-auto w-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })) }}
              className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.email ? "border-burgundy" : "border-jet/10"}`}
              placeholder="your@email.com" required />
            {fieldErrors.email && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })) }}
                className={`w-full h-12 px-4 pr-10 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.password ? "border-burgundy" : "border-jet/10"}`}
                placeholder="Enter your password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-jet/30 hover:text-jet/60 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.password}</p>}
          </div>

          {error && <div className="flex items-start gap-2 bg-amber/5 border border-amber/20 px-3 py-2.5 rounded-sm">
            <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber/10 flex items-center justify-center text-amber"><AlertTriangle size={9} /></span>
            <p className="text-jet/70 text-xs font-poppins">{error}</p>
          </div>}

          <Button type="submit" variant="gold" className="w-full h-12" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-jet/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#f8f5f0] px-3 text-jet/30 font-poppins">or continue with</span></div>
          </div>

          <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
            className="w-full h-12 flex items-center justify-center gap-3 border border-jet/10 bg-cream text-jet/70 text-sm font-poppins hover:bg-jet hover:text-cream hover:border-jet transition-all duration-300 disabled:opacity-50">
            {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <Chrome size={16} />}
            {googleLoading ? "Connecting..." : "Google"}
          </button>
        </form>

        <p className="text-center text-jet/40 text-xs font-poppins mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-gold hover:text-gold-light transition-colors">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
