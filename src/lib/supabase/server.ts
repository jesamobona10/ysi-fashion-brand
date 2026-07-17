import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function assertBaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
}

function assertServiceConfig() {
  if (!supabaseServiceRoleKey) {
    throw new Error("Missing Supabase env var: SUPABASE_SERVICE_ROLE_KEY")
  }
}

export function createRouteSupabaseClient(request: Request, responseHeaders?: Headers) {
  assertBaseConfig()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        const cookieHeader = request.headers.get("cookie") || ""
        return cookieHeader
          .split(";")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((cookie) => {
            const [name, ...valueParts] = cookie.split("=")
            return { name, value: valueParts.join("=") }
          })
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        if (!responseHeaders) return
        for (const cookie of cookiesToSet) {
          responseHeaders.append("set-cookie", `${cookie.name}=${cookie.value}; Path=/; HttpOnly; SameSite=Lax`)
        }
      },
    },
  })
}

export async function createActionSupabaseClient() {
  assertBaseConfig()

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {},
    },
  })
}

export function createServiceSupabaseClient(): SupabaseClient {
  assertBaseConfig()
  assertServiceConfig()

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
