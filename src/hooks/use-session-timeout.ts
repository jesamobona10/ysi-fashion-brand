"use client"
import { useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

export function useSessionTimeout(timeoutMinutes = 60) {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isAuthenticated) return
    timerRef.current = setTimeout(async () => {
      await logout()
      router.push("/auth/login?expired=true")
    }, timeoutMinutes * 60 * 1000)
  }, [isAuthenticated, logout, router, timeoutMinutes])

  useEffect(() => {
    if (!isAuthenticated) return
    const events = ["mousedown", "touchstart", "keydown", "scroll", "mousemove"]
    for (const ev of events) window.addEventListener(ev, resetTimer)
    resetTimer()
    return () => {
      for (const ev of events) window.removeEventListener(ev, resetTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAuthenticated, resetTimer])
}
