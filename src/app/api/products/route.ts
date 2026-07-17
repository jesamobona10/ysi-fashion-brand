import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const serviceClient = createServiceSupabaseClient()

    const { data, error } = await serviceClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
