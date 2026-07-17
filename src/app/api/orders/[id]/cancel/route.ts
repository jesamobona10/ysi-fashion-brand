import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const query = serviceClient.from("orders").select("id, status, order_items(id, product_id, quantity)").eq("customer_id", customer.id)
    if (isUuid) {
      query.eq("id", id)
    } else {
      query.eq("order_number", id)
    }

    const { data: order, error: orderError } = await query.maybeSingle()
    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json({ error: "Order can no longer be cancelled" }, { status: 400 })
    }

    const now = new Date().toISOString()

    const { error: updateError } = await serviceClient
      .from("orders")
      .update({ status: "cancelled", cancelled_at: now, cancelled_reason: "Cancelled by customer" })
      .eq("id", order.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
    }

    const { error: timelineError } = await serviceClient
      .from("order_timeline")
      .insert({ order_id: order.id, status: "cancelled", note: "Order cancelled by customer", created_at: now })

    if (timelineError) {
      console.error("Failed to add timeline entry:", timelineError)
    }

    for (const item of order.order_items || []) {
      const { error: stockError } = await serviceClient.rpc("restore_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })

      if (stockError) {
        const { data: product } = await serviceClient.from("products").select("stock_qty").eq("id", item.product_id).single()
        if (product) {
          await serviceClient.from("products").update({ stock_qty: Number(product.stock_qty) + item.quantity }).eq("id", item.product_id)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Cancel order error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
