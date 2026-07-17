import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim()
  const limit = Math.min(Number(url.searchParams.get("limit")) || 8, 20)

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const serviceClient = createServiceSupabaseClient()

    const { data: products, error } = await serviceClient
      .from("products")
      .select("id, name, slug, price, images, category")
      .or(`name.ilike.%${q}%,category.ilike.%${q}%,fabric.ilike.%${q}%`)
      .eq("status", "active")
      .order("name")
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    return NextResponse.json({ suggestions: products || [] })
  } catch (err) {
    console.error("Search autocomplete error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
