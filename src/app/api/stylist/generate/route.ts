import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { generateOutfits, type StylistRequest } from "@/lib/ai/stylist"
import { OCCASIONS } from "@/lib/ai/constants"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StylistRequest
    const { occasion, vibe, gender, description } = body

    if (!occasion || !vibe || !gender) {
      return NextResponse.json({ error: "occasion, vibe, and gender are required" }, { status: 400 })
    }

    const validOccasion = OCCASIONS.find((o) => o.value === occasion)
    if (!validOccasion) {
      return NextResponse.json({ error: "Invalid occasion" }, { status: 400 })
    }

    const serviceClient = createServiceSupabaseClient()

    let query = serviceClient
      .from("products")
      .select("id, name, slug, price, images, category, colors, fabric, description, gender, occasion, style, tags, season")
      .eq("status", "active")
      .eq("in_stock", true)

    if (gender !== "both") {
      query = query.eq("gender", gender)
    }

    if (occasion) {
      query = query.or(`occasion.eq.${occasion},tags.cs.{${occasion}}`)
    }

    const { data: products, error } = await query.limit(50)

    if (error) {
      console.error("Stylist product fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "No products found for this selection. Try different criteria." }, { status: 404 })
    }

    const requestData: StylistRequest = { occasion, vibe, gender, description }
    const outfits = await generateOutfits(products, requestData)

    if (outfits.length === 0) {
      return NextResponse.json({ error: "Could not create outfits from available products. Try different criteria." }, { status: 404 })
    }

    return NextResponse.json({ outfits, totalProducts: products.length })
  } catch (err) {
    console.error("Stylist error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
