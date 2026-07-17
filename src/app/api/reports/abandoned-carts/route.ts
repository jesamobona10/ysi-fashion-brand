import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const serviceClient = createServiceSupabaseClient()
    const { data, error } = await serviceClient
      .from("abandoned_carts")
      .select("*")
      .order("hours_abandoned", { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch abandoned carts" }, { status: 500 })
    }

    return NextResponse.json({ carts: data || [] })
  } catch (err) {
    console.error("Abandoned carts error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
