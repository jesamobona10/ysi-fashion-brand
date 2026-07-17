import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { sanitizeString } from "@/lib/validation"

export async function GET() {
  try {
    const serviceClient = createServiceSupabaseClient()
    const { data, error } = await serviceClient
      .from("articles")
      .select("*, author:author_id(name)")
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ articles: data || [] })
  } catch (err) {
    console.error("Articles fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
