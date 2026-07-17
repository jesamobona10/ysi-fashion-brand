import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { checkRateLimit, rateLimitKey } from "@/lib/server/rate-limit"

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const rateCheck = checkRateLimit(rateLimitKey("fulfill-preorder", ip), { maxRequests: 10, windowMs: 60_000 })
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const { productId, adminId, adminEmail } = body as { productId: string; adminId: string; adminEmail: string }

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const serviceClient = createServiceSupabaseClient()

    const { data: product } = await serviceClient
      .from("products")
      .select("id, name, slug")
      .eq("id", productId)
      .single()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { data: preOrders } = await serviceClient
      .from("orders")
      .select("id, order_number")
      .eq("order_type", "pre_order")
      .not("status", "in", '("cancelled","refunded","delivered")')

    if (!preOrders || preOrders.length === 0) {
      return NextResponse.json({ fulfilled: 0, message: "No pending pre-orders found for this product" })
    }

    const now = new Date().toISOString()
    let fulfilled = 0

    for (const order of preOrders) {
      const { data: items } = await serviceClient
        .from("order_items")
        .select("id")
        .eq("order_id", order.id)
        .eq("product_id", productId)

      if (!items || items.length === 0) continue

      await serviceClient
        .from("orders")
        .update({ status: "confirmed", updated_at: now })
        .eq("id", order.id)

      await serviceClient
        .from("order_timeline")
        .insert({
          order_id: order.id,
          status: "confirmed",
          note: `Auto-fulfilled — "${product.name}" is now available`,
        })

      if (adminId) {
        await serviceClient
          .from("admin_audit_log")
          .insert({
            admin_id: adminId,
            admin_email: adminEmail || "unknown",
            action: "fulfill_pre_orders",
            entity_type: "order",
            entity_id: order.id,
            details: { product_id: productId, product_name: product.name, order_number: order.order_number },
          })
      }

      fulfilled++
    }

    return NextResponse.json({ fulfilled, product: product.name })
  } catch (err) {
    console.error("Pre-order fulfillment error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const serviceClient = createServiceSupabaseClient()

    const { data: orders } = await serviceClient
      .from("orders")
      .select("id, order_number, created_at, status, total, customers!inner(name, email)")
      .eq("order_type", "pre_order")
      .not("status", "in", '("cancelled","refunded","delivered")')

    const relevant = (orders || []).filter((o: Record<string, unknown>) => {
      return o.status !== "cancelled" && o.status !== "refunded"
    })

    return NextResponse.json({ orders: relevant.length, pendingValue: relevant.reduce((s: number, o: any) => s + Number(o.total || 0), 0) })
  } catch (err) {
    console.error("Pre-order count error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
