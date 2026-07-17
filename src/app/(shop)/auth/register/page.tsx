"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Mail, AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Captcha } from "@/components/ui/captcha"
import { isValidEmail } from "@/lib/validation"
import { friendlyError } from "@/lib/friendly-error"
import { useToast } from "@/components/ui/toast"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState("")
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", password: "" })
  const [captchaToken, setCaptchaToken] = useState("")
  const { toast } = useToast()

  const validate = (): boolean => {
    const errors = { name: "", email: "", password: "" }
    let valid = true

    if (!name.trim()) { errors.name = "Name is required"; valid = false }
    else if (name.trim().length < 2) { errors.name = "Name must be at least 2 characters"; valid = false }
    else if (name.trim().length > 200) { errors.name = "Name is too long"; valid = false }

    if (!email.trim()) { errors.email = "Email is required"; valid = false }
    else if (!isValidEmail(email)) { errors.email = "Please enter a valid email"; valid = false }

    if (!password) { errors.password = "Password is required"; valid = false }
    else if (password.length < 6) { errors.password = "Password must be at least 6 characters"; valid = false }
    else if (password.length > 128) { errors.password = "Password is too long"; valid = false }

    setFieldErrors(errors)
    return valid
  }

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (submitting || cooldown > 0) return
    if (!captchaToken) { setError("Please complete the security check"); return }

    setError("")
    setConfirmEmail(false)
    setSubmitting(true)
    const result = await register(email, password, name.trim())
    setSubmitting(false)
    if (result.ok) {
      if (result.accountCreated) {
        toast({ title: "Account created!", variant: "success" })
        router.push("/account")
      } else {
        toast({ title: "Check your email", description: "We sent a confirmation link.", variant: "info" })
        setConfirmEmail(true)
      }
    } else {
      const friendly = friendlyError(result.error || "We weren't able to create your account")
      toast({ title: "Unable to create account", description: friendly, variant: "error" })
      setError(friendly)
      if (result.error?.toLowerCase().includes("rate limit") || result.error?.toLowerCase().includes("too many")) {
        setCooldown(60)
      }
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
        {confirmEmail ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Mail size={28} className="text-gold" />
            </div>
            <h1 className="font-display text-3xl text-jet">Check Your Email</h1>
            <p className="text-jet/50 text-sm font-poppins mt-3 leading-relaxed">
              We sent a confirmation link to <strong className="text-jet">{email}</strong>.
              Please check your inbox and click the link to activate your account.
            </p>
            <p className="text-jet/30 text-xs font-poppins mt-4">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button onClick={() => setConfirmEmail(false)} className="text-gold hover:text-gold-light underline">
                try again
              </button>
            </p>
            <Link href="/auth/login" className="mt-8 inline-flex items-center h-10 px-6 border border-jet/10 text-sm font-poppins text-jet/60 hover:bg-jet hover:text-cream transition-all">
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="font-display text-4xl text-jet">Create Account</h1>
              <p className="text-jet/50 text-sm font-poppins mt-2">Join YSI and elevate your style</p>
              <div className="gold-divider mt-6 mx-auto w-16" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-2">Full Name</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: "" })) }}
                  className={`w-full h-12 px-4 bg-cream border text-jet text-sm font-poppins focus:outline-none focus:border-gold/50 ${fieldErrors.name ? "border-burgundy" : "border-jet/10"}`}
                  placeholder="Your name" required />
                {fieldErrors.name && <p className="text-burgundy text-[10px] font-poppins mt-1">{fieldErrors.name}</p>}
              </div>
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
                    placeholder="Min. 6 characters" required />
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

              <Captcha onVerify={setCaptchaToken} />

              <Button type="submit" variant="gold" className="w-full h-12" disabled={submitting || cooldown > 0}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : cooldown > 0 ? `Wait ${cooldown}s` : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-jet/40 text-xs font-poppins mt-6">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-gold hover:text-gold-light transition-colors">Sign in</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}