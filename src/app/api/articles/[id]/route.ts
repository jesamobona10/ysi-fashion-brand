import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"
import { sanitizeString } from "@/lib/validation"
import { toSlug } from "@/lib/slug"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const serviceClient = createServiceSupabaseClient()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const query = serviceClient.from("articles").select("*, author:author_id(name)")
    if (isUuid) query.eq("id", id)
    else query.eq("slug", id)
    const { data, error } = await query.maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: "Article not found" }, { status: 404 })
    return NextResponse.json({ article: data })
  } catch (err) {
    console.error("Article fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === "new"
  try {
    const userClient = createRouteSupabaseClient(request)
    const { data: { session } } = await userClient.auth.getSession()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const serviceClient = createServiceSupabaseClient()
    const { data: admin } = await serviceClient.from("admin_users").select("id").eq("auth_user_id", session.user.id).maybeSingle()
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const body = await request.json()
    const { title, content, excerpt, featured_image, meta_description, tags, status } = body as Record<string, string>

    const slug = toSlug(title || "untitled")
    const payload = {
      title: sanitizeString(title || "", 200),
      slug,
      content: sanitizeString(content || "", 50000),
      excerpt: sanitizeString(excerpt || "", 500),
      featured_image: featured_image || null,
      meta_description: sanitizeString(meta_description || "", 300),
      tags: Array.isArray(tags) ? tags : [],
      status: status || "draft",
      author_id: admin.id,
    }

    if (isNew) {
      const { error } = await serviceClient.from("articles").insert(payload)
      if (error) throw error
    } else {
      const { error } = await serviceClient.from("articles").update(payload).eq("id", id)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Article save error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const serviceClient = createServiceSupabaseClient()
    const { error } = await serviceClient.from("articles").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Article delete error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
