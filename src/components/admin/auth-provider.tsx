"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { sanitizeEmail } from "@/lib/validation"

function setAuthCookies(accessToken: string, refreshToken: string) {
  if (typeof document === "undefined") return
  document.cookie = `ysi_access_token=${accessToken}; path=/; max-age=${60 * 60}; SameSite=Lax`
  document.cookie = `ysi_refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
  document.cookie = `ysi_admin_access_token=${accessToken}; path=/; max-age=${60 * 60}; SameSite=Lax`
  document.cookie = `ysi_admin_refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
}

function removeAuthCookies() {
  if (typeof document === "undefined") return
  document.cookie = "ysi_access_token=; path=/; max-age=0; SameSite=Lax"
  document.cookie = "ysi_refresh_token=; path=/; max-age=0; SameSite=Lax"
  document.cookie = "ysi_admin_access_token=; path=/; max-age=0; SameSite=Lax"
  document.cookie = "ysi_admin_refresh_token=; path=/; max-age=0; SameSite=Lax"
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const pattern = new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  const match = document.cookie.match(pattern)
  return match ? decodeURIComponent(match[1]) : null
}

function decodeJWTPayload(token: string): { sub: string; email: string } | null {
  try {
    let payload = token.split(".")[1]
    payload = payload.replace(/-/g, "+").replace(/_/g, "/")
    while (payload.length % 4) payload += "="
    const json = JSON.parse(atob(payload))
    return { sub: json.sub, email: json.email }
  } catch {
    return null
  }
}

interface AdminProfile {
  id: string
  name: string
  email: string
  avatar: string
  role: "super-admin" | "admin" | "manager"
  phone?: string
}

interface AuthState {
  user: AdminProfile | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  accessToken: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
    accessToken: null,
  })

  const loadUser = useCallback(async (accessToken: string): Promise<boolean> => {
    const decoded = decodeJWTPayload(accessToken)
    if (!decoded?.sub) {
      setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false, accessToken: null })
      return false
    }

    const { data, error } = await supabase.auth.getUser(accessToken)
    const user = data?.user
    if (error || !user) {
      setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false, accessToken: null })
      return false
    }

    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("id, name, email, role, phone")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (adminError || !adminRecord) {
      setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false, accessToken: null })
      return false
    }

    setState({
      user: {
        id: adminRecord.id,
        name: adminRecord.name,
        email: adminRecord.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(adminRecord.name)}&background=1a1a1a&color=d4af37`,
        role: adminRecord.role as AdminProfile["role"],
        phone: adminRecord.phone || undefined,
      },
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
      accessToken: accessToken,
    })
    return true
  }, [])

  useEffect(() => {
    const hydrate = async () => {
      const session = await supabase.auth.getSession()
      const accessToken = session.data.session?.access_token || getCookieValue("ysi_access_token") || getCookieValue("ysi_admin_access_token")

      if (accessToken) {
        await loadUser(accessToken)
        return
      }

      setState((s) => ({ ...s, loading: false }))
    }

    void hydrate()
  }, [loadUser])

  const login = async (email: string, password: string): Promise<boolean> => {
    const safeEmail = sanitizeEmail(email)
    if (!safeEmail || !password) return false
    setState((s) => ({ ...s, loading: true }))
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: safeEmail, password })
      const session = data?.session
      if (error || !session) {
        setState((s) => ({ ...s, loading: false }))
        return false
      }

      setAuthCookies(session.access_token, session.refresh_token)
      const verified = await loadUser(session.access_token)
      if (!verified) {
        removeAuthCookies()
        setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false, accessToken: null })
      }
      return verified
    } catch {
      setState((s) => ({ ...s, loading: false }))
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    removeAuthCookies()
    setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false, accessToken: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return ctx
}
