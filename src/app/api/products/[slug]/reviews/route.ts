import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"
import { sanitizeString } from "@/lib/validation"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const url = new URL(request.url)
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 50)
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0)

  try {
    const serviceClient = createServiceSupabaseClient()

    const { data: product } = await serviceClient
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { data: reviews, error: reviewsError } = await serviceClient
      .from("reviews")
      .select("*, customer:customer_id(name)")
      .eq("product_id", product.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (reviewsError) {
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }

    const { count } = await serviceClient
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("product_id", product.id)
      .eq("status", "approved")

    return NextResponse.json({ reviews: reviews || [], total: count || 0 })
  } catch (err) {
    console.error("Reviews fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { rating, title, body: reviewBody, images } = body as {
      rating: number
      title?: string
      body?: string
      images?: string[]
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const serviceClient = createServiceSupabaseClient()

    const { data: product } = await serviceClient
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { data: customer } = await serviceClient
      .from("customers")
      .select("id")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }

    const { data: existingReview } = await serviceClient
      .from("reviews")
      .select("id")
      .eq("product_id", product.id)
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 })
    }

    const { error: insertError } = await serviceClient
      .from("reviews")
      .insert({
        product_id: product.id,
        customer_id: customer.id,
        auth_user_id: session.user.id,
        rating,
        title: sanitizeString(title || "", 200),
        body: sanitizeString(reviewBody || "", 2000),
        images: images || [],
        status: "pending",
      })

    if (insertError) {
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Review create error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
