import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"
import { sanitizeString } from "@/lib/validation"

export async function GET(request: Request) {
  try {
    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ history: [] })
    }

    const serviceClient = createServiceSupabaseClient()
    const { data, error } = await serviceClient
      .from("search_history")
      .select("query, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
    }

    return NextResponse.json({ history: data || [] })
  } catch (err) {
    console.error("Search history error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, resultsCount } = body as { query: string; resultsCount?: number }
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()

    const serviceClient = createServiceSupabaseClient()
    const { error } = await serviceClient
      .from("search_history")
      .insert({
        user_id: session?.user?.id || null,
        query: sanitizeString(query.trim(), 200),
        results_count: resultsCount || 0,
      })

    if (error) {
      console.error("Failed to save search history:", error)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Search history save error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
