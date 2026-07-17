"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { setAuthCookies } from "@/lib/auth/shared"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        router.push("/auth/login?error=session_expired")
        return
      }
      setAuthCookies(data.session.access_token, data.session.refresh_token)
      router.push("/account")
    }
    void handleCallback()
  }, [router])

  return (
    <div className="pt-[72px] lg:pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={24} className="animate-spin text-gold mx-auto" />
        <p className="font-poppins text-sm text-jet/50 mt-4">Completing sign in...</p>
      </div>
    </div>
  )
}
