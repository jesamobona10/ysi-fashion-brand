import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { sanitizeEmail } from "@/lib/validation"

const MAX_ATTEMPTS = 5
const LOCKOUT_WINDOW_MINUTES = 15

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body as { email: string }
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const serviceClient = createServiceSupabaseClient()
    const sanitized = sanitizeEmail(email)

    const since = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count } = await serviceClient
      .from("login_attempts")
      .select("*", { count: "exact", head: true })
      .eq("email", sanitized)
      .eq("success", false)
      .gte("attempted_at", since)

    const attempts = count || 0
    const locked = attempts >= MAX_ATTEMPTS
    const remainingMinutes = locked ? LOCKOUT_WINDOW_MINUTES : 0

    return NextResponse.json({ locked, remainingMinutes, attempts })
  } catch (err) {
    console.error("Lockout check error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { email, success } = body as { email: string; success: boolean }
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const serviceClient = createServiceSupabaseClient()
    const sanitized = sanitizeEmail(email)

    if (success) {
      await serviceClient
        .from("login_attempts")
        .delete()
        .eq("email", sanitized)
        .eq("success", false)
    } else {
      await serviceClient
        .from("login_attempts")
        .insert({ email: sanitized, success: false })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Lockout record error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
