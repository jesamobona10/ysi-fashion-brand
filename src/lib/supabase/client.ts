import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient, Provider } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let browserClient: SupabaseClient | null = null

function assertSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
}

export function getSupabaseBrowserClient() {
  assertSupabaseConfig()

  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowserClient can only be used in the browser")
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  }

  return browserClient
}

export const supabase = {
  auth: {
    getSession: () => getSupabaseBrowserClient().auth.getSession(),
    getUser: (accessToken?: string) => getSupabaseBrowserClient().auth.getUser(accessToken),
    signInWithPassword: ({ email, password }: { email: string; password: string }) =>
      getSupabaseBrowserClient().auth.signInWithPassword({ email, password }),
    signUp: ({
      email,
      password,
      options,
    }: {
      email: string
      password: string
      options?: { data?: { name?: string } }
    }) => getSupabaseBrowserClient().auth.signUp({ email, password, options }),
    signInWithOAuth: (params: { provider: Provider; options?: { redirectTo?: string } }) =>
      getSupabaseBrowserClient().auth.signInWithOAuth(params),
    signOut: () => getSupabaseBrowserClient().auth.signOut(),
    onAuthStateChange: (...args: Parameters<SupabaseClient["auth"]["onAuthStateChange"]>) =>
      getSupabaseBrowserClient().auth.onAuthStateChange(...args),
  },
  from: (table: string) => getSupabaseBrowserClient().from(table),
  rpc: (fn: string, args?: Record<string, unknown>) => getSupabaseBrowserClient().rpc(fn, args),
  get storage() {
    return getSupabaseBrowserClient().storage
  },
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export type { SupabaseClient }
