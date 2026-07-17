import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const unreadOnly = url.searchParams.get("unread") === "true"

    const serviceClient = createServiceSupabaseClient()
    let query = serviceClient
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ notifications: data || [] })
  } catch (err) {
    console.error("Notifications fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllRead } = body as { notificationId?: string; markAllRead?: boolean }

    const serviceClient = createServiceSupabaseClient()

    if (markAllRead) {
      const { error } = await serviceClient
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false)
      if (error) throw error
    } else if (notificationId) {
      const { error } = await serviceClient
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", session.user.id)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Notifications update error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
