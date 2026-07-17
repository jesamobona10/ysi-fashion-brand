import { NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const serviceClient = createServiceSupabaseClient()

    const { data: monthlyRevenue, error: revenueError } = await serviceClient
      .rpc("get_monthly_revenue")

    if (revenueError) {
      const { data: fallback } = await serviceClient
        .from("orders")
        .select("created_at, total")
        .eq("payment_status", "paid")
        .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString())
        .order("created_at")

      const monthly: Record<string, number> = {}
      for (const row of (fallback || []) as { created_at: string; total: number }[]) {
        const month = row.created_at.slice(0, 7)
        monthly[month] = (monthly[month] || 0) + Number(row.total)
      }

      return NextResponse.json({
        monthly: Object.entries(monthly).map(([month, revenue]) => ({ month, revenue })),
        total: Object.values(monthly).reduce((a, b) => a + b, 0),
      })
    }

    return NextResponse.json({ monthly: monthlyRevenue || [] })
  } catch (err) {
    console.error("Revenue report error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
