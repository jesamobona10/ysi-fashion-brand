import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const serviceClient = createServiceSupabaseClient()

    const [preOrderCount, preOrderRevenue, upcomingReleases, fulfillmentRate] = await Promise.all([
      serviceClient
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("order_type", "pre_order")
        .not("status", "in", '("cancelled","refunded")'),

      serviceClient
        .from("orders")
        .select("total")
        .eq("order_type", "pre_order")
        .not("status", "in", '("cancelled","refunded")'),

      serviceClient
        .from("products")
        .select("id, name, slug, price, pre_order_release_date, images")
        .eq("pre_order_enabled", true)
        .gte("pre_order_release_date", new Date().toISOString())
        .order("pre_order_release_date", { ascending: true })
        .limit(20),

      serviceClient
        .from("orders")
        .select("status", { count: "exact", head: true })
        .eq("order_type", "pre_order")
        .eq("status", "delivered"),
    ])

    const count = preOrderCount.count || 0

    const revenue = (preOrderRevenue.data || []).reduce(
      (sum: number, o: Record<string, unknown>) => sum + Number(o.total || 0),
      0
    )

    const releases = (upcomingReleases.data || []).map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      image: Array.isArray(p.images) ? (p.images as string[])[0] || "" : "",
      releaseDate: p.pre_order_release_date,
    }))

    const deliveredCount = fulfillmentRate.count || 0
    const fulfillmentPct = count > 0 ? Math.round((deliveredCount / count) * 100) : 0

    return NextResponse.json({
      pendingCount: count,
      revenue,
      upcomingReleases: releases,
      fulfillmentRate: fulfillmentPct,
      deliveredCount,
    })
  } catch (err) {
    console.error("Pre-order report error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
