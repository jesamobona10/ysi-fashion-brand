"use client"

import { useAdminAuth } from "@/components/admin/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  const { isAuthenticated, isAdmin, loading, login } = useAdminAuth()
  const router = useRouter()
  const [email, setEmail] = useState("admin@ysi.ng")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) router.replace("/admin")
  }, [loading, isAuthenticated, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-jet flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  if (isAuthenticated && isAdmin) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    const ok = await login(email, password)
    setSubmitting(false)
    if (ok) {
      router.replace("/admin")
    } else {
      setError("Access denied. Check your credentials or contact a super-admin.")
    }
  }

  return (
    <div className="min-h-screen bg-jet flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black tracking-[0.15em] text-cream">
            YSI
          </h1>
          <p className="text-cream/40 text-xs tracking-luxe-sm font-poppins uppercase mt-2">
            Admin Portal
          </p>
          <div className="gold-divider mt-6 mx-auto w-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-poppins uppercase tracking-luxe text-cream/50 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 px-4 text-cream text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors placeholder:text-cream/20"
              placeholder="admin@ysi.ng"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-poppins uppercase tracking-luxe text-cream/50 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 px-4 pr-10 text-cream text-sm font-poppins focus:outline-none focus:border-gold/50 transition-colors placeholder:text-cream/20"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-burgundy text-xs font-poppins bg-burgundy/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" variant="gold" className="w-full h-12" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-cream/20 text-xs font-poppins mt-8">
          YSI Admin v1.0 &bull; Styling You With Finesse
        </p>
      </motion.div>
    </div>
  )
}
