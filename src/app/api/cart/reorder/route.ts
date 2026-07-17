import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body as { orderId: string }
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceClient = createServiceSupabaseClient()

    const { data: customer } = await serviceClient
      .from("customers")
      .select("id")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select("id, order_items(product_id, name, quantity, price, size, color)")
      .eq("id", orderId)
      .eq("customer_id", customer.id)
      .maybeSingle()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const cartItems = (order.order_items as { product_id: string; name: string; quantity: number; price: number; size: string | null; color: string | null }[]).map((item) => ({
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size || "",
      color: item.color || "",
    }))

    const { error: upsertError } = await serviceClient
      .from("carts")
      .upsert(
        { user_id: session.user.id, items: cartItems },
        { onConflict: "user_id", ignoreDuplicates: false }
      )

    if (upsertError) {
      return NextResponse.json({ error: "Failed to add items to cart" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, items: cartItems.length })
  } catch (err) {
    console.error("Reorder error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
