import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const serviceClient = createServiceSupabaseClient()

    const { data: permissions, error: permError } = await serviceClient
      .from("permissions")
      .select("*")
      .order("group_name")
      .order("name")

    if (permError) throw permError

    const { data: rolePerms, error: rpError } = await serviceClient
      .from("role_permissions")
      .select("*")

    if (rpError) throw rpError

    const grouped: Record<string, { code: string; name: string; description: string | null }[]> = {}
    for (const p of permissions || []) {
      const group = (p as Record<string, unknown>).group_name as string
      if (!grouped[group]) grouped[group] = []
      grouped[group].push({
        code: (p as Record<string, unknown>).code as string,
        name: (p as Record<string, unknown>).name as string,
        description: (p as Record<string, unknown>).description as string | null,
      })
    }

    const rolePermissions: Record<string, string[]> = {}
    for (const rp of rolePerms || []) {
      const role = (rp as Record<string, unknown>).role as string
      if (!rolePermissions[role]) rolePermissions[role] = []
      rolePermissions[role].push((rp as Record<string, unknown>).permission_code as string)
    }

    return NextResponse.json({
      groups: grouped,
      rolePermissions,
      roles: ["super-admin", "admin", "manager"],
    })
  } catch (err) {
    console.error("Permissions fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceClient = createServiceSupabaseClient()

    const { data: admin } = await serviceClient
      .from("admin_users")
      .select("role")
      .eq("auth_user_id", session.user.id)
      .maybeSingle()

    if (!admin || admin.role !== "super-admin") {
      return NextResponse.json({ error: "Only super admins can manage permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { role, permissionCode, granted } = body as { role: string; permissionCode: string; granted: boolean }

    if (granted) {
      const { error } = await serviceClient
        .from("role_permissions")
        .insert({ role, permission_code: permissionCode })
      if (error) throw error
    } else {
      const { error } = await serviceClient
        .from("role_permissions")
        .delete()
        .eq("role", role)
        .eq("permission_code", permissionCode)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Permission update error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
