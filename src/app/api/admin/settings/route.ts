import { NextResponse } from "next/server"
import { createRouteSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = createRouteSupabaseClient(request)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!adminRecord) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 })
  }

  return NextResponse.json({
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    freeShippingThreshold: String(data.free_shipping_threshold),
    flatShippingRate: String(data.flat_shipping_rate),
  })
}

export async function PUT(request: Request) {
  const supabase = createRouteSupabaseClient(request)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!adminRecord) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  const { error } = await supabase
    .from("store_settings")
    .update({
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      free_shipping_threshold: Number(body.freeShippingThreshold),
      flat_shipping_rate: Number(body.flatShippingRate),
      updated_by: adminRecord.id,
    })
    .eq("id", 1)

  if (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
