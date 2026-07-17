"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { sanitizeEmail, sanitizeString } from "@/lib/validation"
import { setAuthCookies, removeAuthCookies } from "@/lib/auth/shared"
import type { CustomerUser } from "@/lib/auth/shared"

interface AuthState {
  user: CustomerUser | null
  isAuthenticated: boolean
  loading: boolean
}

interface RegisterResult {
  ok: boolean
  error?: string
  accountCreated?: boolean
  needsConfirmation?: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<RegisterResult>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, isAuthenticated: false, loading: true,
  })

  const loadUser = useCallback(async (accessToken: string) => {
    try {
      const { data, error } = await supabase.auth.getUser(accessToken)
      const userData = data?.user
      if (!userData || error) {
        setState({ user: null, isAuthenticated: false, loading: false })
        return
      }

      const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", userData.id)
        .maybeSingle()

      if (adminRecord) {
        setState({ user: null, isAuthenticated: false, loading: false })
        return
      }

      setState({
        user: { id: userData.id, email: userData.email || "", name: (userData.user_metadata?.name as string | undefined) || undefined },
        isAuthenticated: true,
        loading: false,
      })
    } catch {
      setState({ user: null, isAuthenticated: false, loading: false })
    }
  }, [])

  useEffect(() => {
    const hydrate = async () => {
      const session = await supabase.auth.getSession()
      if (session.data.session?.access_token) {
        await loadUser(session.data.session.access_token)
      } else {
        setState((s) => ({ ...s, loading: false }))
      }
    }

    void hydrate()
  }, [loadUser])

  const login = useCallback(async (email: string, password: string) => {
    const safeEmail = sanitizeEmail(email)
    if (!safeEmail || !password) return { ok: false, error: "Email and password are required" }
    setState((s) => ({ ...s, loading: true }))
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: safeEmail, password })
      const session = data?.session
      const user = data?.user
      if (error || !session || !user) {
        setState((s) => ({ ...s, loading: false }))
        return { ok: false, error: error?.message || "Login failed" }
      }
      const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle()

      if (adminRecord) {
        await supabase.auth.signOut()
        setState({ user: null, isAuthenticated: false, loading: false })
        return { ok: false, error: "Access denied" }
      }

      setAuthCookies(session.access_token, session.refresh_token)
      setState({
        user: { id: user.id, email: user.email || "", name: (user.user_metadata?.name as string | undefined) || undefined },
        isAuthenticated: true,
        loading: false,
      })
      return { ok: true }
    } catch (e) {
      setState((s) => ({ ...s, loading: false }))
      return { ok: false, error: String(e) }
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const safeEmail = sanitizeEmail(email)
    const safeName = sanitizeString(name, 200)
    if (!safeEmail) return { ok: false, error: "Email is required" }
    if (!password || password.length < 6) return { ok: false, error: "Password must be at least 6 characters" }
    if (!safeName) return { ok: false, error: "Name is required" }
    setState((s) => ({ ...s, loading: true }))
    try {
      const { data, error } = await supabase.auth.signUp({
        email: safeEmail,
        password,
        options: { data: { name: safeName } },
      })
      const session = data?.session
      const user = data?.user
      if (error || !user) {
        setState((s) => ({ ...s, loading: false }))
        return { ok: false, error: error?.message || "Registration failed" }
      }
      if (session) {
        setAuthCookies(session.access_token, session.refresh_token)
        setState({
          user: { id: user.id, email: user.email || "", name: safeName },
          isAuthenticated: true,
          loading: false,
        })
        return { ok: true, accountCreated: true }
      }

      setState((s) => ({ ...s, loading: false }))
      return { ok: true, accountCreated: false, needsConfirmation: false }
    } catch (e) {
      setState((s) => ({ ...s, loading: false }))
      return { ok: false, error: String(e) }
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setState((s) => ({ ...s, loading: false }))
      console.error("Google sign-in error:", error.message)
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    removeAuthCookies()
    setState({ user: null, isAuthenticated: false, loading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
