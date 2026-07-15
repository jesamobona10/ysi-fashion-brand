import { createServiceSupabaseClient } from "@/lib/supabase/server"

export interface AdminProfile {
  id: string
  name: string
  email: string
  role: "super-admin" | "admin" | "manager"
  phone?: string
}

export async function getAdminProfile(authUserId: string): Promise<AdminProfile | null> {
  const client = createServiceSupabaseClient()
  const { data, error } = await client
    .from("admin_users")
    .select("id, name, email, role, phone")
    .eq("auth_user_id", authUserId)
    .maybeSingle()

  if (error || !data) return null
  return data as AdminProfile
}

export async function verifyAdmin(authUserId: string): Promise<boolean> {
  const profile = await getAdminProfile(authUserId)
  return profile !== null
}
