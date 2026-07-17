import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const serviceClient = createServiceSupabaseClient()
    const { data, error } = await serviceClient
      .from("popular_searches")
      .select("query, search_count")
      .limit(10)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch popular searches" }, { status: 500 })
    }

    return NextResponse.json({ popular: data || [] })
  } catch (err) {
    console.error("Popular searches error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
