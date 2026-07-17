import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceClient = createServiceSupabaseClient()

    const orderNumberOrId = id

    const { data: customer } = await serviceClient
      .from("customers")
      .select("id")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (!customer) {
      const { data: adminCheck } = await serviceClient
        .from("admins")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle()

      if (!adminCheck) {
        return NextResponse.json({ error: "Customer or admin not found" }, { status: 404 })
      }
    }

    const query = serviceClient
      .from("orders")
      .select("*, order_items(*), order_timeline(*)")

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUuid) {
      query.eq("id", id)
    } else {
      query.eq("order_number", orderNumberOrId)
    }

    const { data: order, error: orderError } = await query.maybeSingle()

    if (orderError) {
      return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error("Order fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
