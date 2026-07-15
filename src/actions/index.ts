"use server"

import { createActionSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"
import { verifyAdmin, getAdminProfile } from "@/lib/server/admin"
import { sanitizeString } from "@/lib/validation"
import { checkRateLimit, rateLimitKey } from "@/lib/server/rate-limit"
import { logAdminAction } from "@/lib/server/audit"

const RATE_LIMITS = {
  orderStatus: { maxRequests: 30, windowMs: 60_000 },
  restock: { maxRequests: 30, windowMs: 60_000 },
  deleteProduct: { maxRequests: 10, windowMs: 60_000 },
}

async function getAdminInfo(userId: string) {
  const profile = await getAdminProfile(userId)
  return {
    id: profile?.id || userId,
    email: profile?.email || "unknown@admin",
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string, note?: string) {
  const supabase = await createActionSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const isAdmin = await verifyAdmin(user.id)
  if (!isAdmin) return { error: "Forbidden: not an admin" }

  const rl = checkRateLimit(rateLimitKey("order-status", user.id), RATE_LIMITS.orderStatus)
  if (!rl.allowed) return { error: "Too many requests. Try again later." }

  const client = createServiceSupabaseClient()
  const safeNote = sanitizeString(note || `Status updated to ${newStatus}`, 500)

  const { error: updateError } = await client
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)

  if (updateError) return { error: "Failed to update order status" }

  const { error: timelineError } = await client
    .from("order_timeline")
    .insert({ order_id: orderId, status: newStatus, note: safeNote })

  if (timelineError) return { error: "Failed to create timeline entry" }

  const admin = await getAdminInfo(user.id)
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "update_order_status",
    entityType: "order",
    entityId: orderId,
    details: { newStatus, note: safeNote },
  })

  return { ok: true }
}

export async function restockProduct(productId: string, quantity: number, note?: string) {
  const supabase = await createActionSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const isAdmin = await verifyAdmin(user.id)
  if (!isAdmin) return { error: "Forbidden: not an admin" }

  const rl = checkRateLimit(rateLimitKey("restock", user.id), RATE_LIMITS.restock)
  if (!rl.allowed) return { error: "Too many requests. Try again later." }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { error: "Quantity must be a positive integer" }
  }

  const client = createServiceSupabaseClient()
  const { data: product, error: fetchError } = await client
    .from("products")
    .select("stock_qty, name")
    .eq("id", productId)
    .maybeSingle()

  if (fetchError || !product) return { error: "Product not found" }

  const prevStock = Number(product.stock_qty) || 0
  const newStock = prevStock + quantity

  const { error: updateError } = await client
    .from("products")
    .update({ stock_qty: newStock, last_restocked: new Date().toISOString() })
    .eq("id", productId)

  if (updateError) return { error: "Failed to update stock" }

  const safeNote = sanitizeString(note || "Manual restock", 500)

  const { error: logError } = await client
    .from("inventory_logs")
    .insert({
      product_id: productId,
      type: "restock",
      quantity,
      previous_stock: prevStock,
      new_stock: newStock,
      note: safeNote,
      performed_by: user.email || "Admin",
    })

  if (logError) return { error: "Failed to log inventory change" }

  const admin = await getAdminInfo(user.id)
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "restock_product",
    entityType: "product",
    entityId: productId,
    details: { quantity, previousStock: prevStock, newStock, note: safeNote },
  })

  return { ok: true, previousStock: prevStock, newStock }
}

export async function deleteProductWithImages(productId: string) {
  const supabase = await createActionSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const isAdmin = await verifyAdmin(user.id)
  if (!isAdmin) return { error: "Forbidden: not an admin" }

  const rl = checkRateLimit(rateLimitKey("delete-product", user.id), RATE_LIMITS.deleteProduct)
  if (!rl.allowed) return { error: "Too many requests. Try again later." }

  const client = createServiceSupabaseClient()
  const { data: product, error: fetchError } = await client
    .from("products")
    .select("images, name")
    .eq("id", productId)
    .maybeSingle()

  if (fetchError || !product) return { error: "Product not found" }

  if (product.images) {
    const storagePaths = (product.images as string[])
      .filter((url: string) => url.includes("supabase.co/storage/v1/object/public/product-images/"))
      .map((url: string) => url.split("product-images/")[1].split("?")[0])
    if (storagePaths.length > 0) {
      await supabase.storage.from("product-images").remove(storagePaths)
    }
  }

  const { error: deleteError } = await client.from("products").delete().eq("id", productId)
  if (deleteError) return { error: "Failed to delete product" }

  const admin = await getAdminInfo(user.id)
  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "delete_product",
    entityType: "product",
    entityId: productId,
    details: { productName: product.name },
  })

  return { ok: true }
}
