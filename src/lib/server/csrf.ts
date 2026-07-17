import { createServiceSupabaseClient, createRouteSupabaseClient } from "@/lib/supabase/server"

export async function generateCsrfToken(request: Request): Promise<string> {
  const userClient = createRouteSupabaseClient(request)
  const { data: { session } } = await userClient.auth.getSession()
  if (!session?.user) return ""

  const token = crypto.randomUUID()
  const serviceClient = createServiceSupabaseClient()
  await serviceClient.from("csrf_tokens").insert({
    user_id: session.user.id,
    token,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  })
  return token
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
  try {
    const token = request.headers.get("x-csrf-token")
    if (!token) return false
    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()
    if (!session?.user) return false
    const serviceClient = createServiceSupabaseClient()
    const { data } = await serviceClient
      .from("csrf_tokens")
      .delete()
      .eq("token", token)
      .eq("user_id", session.user.id)
      .gte("expires_at", new Date().toISOString())
      .select("id")
      .maybeSingle()
    return !!data
  } catch { return false }
}
