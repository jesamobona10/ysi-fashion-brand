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

    const { data: admin } = await serviceClient
      .from("admin_users")
      .select("id, role")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (!admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body as { status: string }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid moderation status" }, { status: 400 })
    }

    const { error: updateError } = await serviceClient
      .from("reviews")
      .update({ status })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Review moderation error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
