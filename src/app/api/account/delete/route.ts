import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceClient = createServiceSupabaseClient()

    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) throw signOutError

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Account deletion error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete account" },
      { status: 500 }
    )
  }
}
