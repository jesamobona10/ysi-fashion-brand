import { NextResponse } from "next/server"
import { createRouteSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server"
import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeString,
  validateCheckoutAddress,
  validateCheckoutContact,
  validateOrderItems,
  validateEnum,
  ALLOWED_PAYMENT_METHODS,
} from "@/lib/validation"
import { checkRateLimit, rateLimitKey } from "@/lib/server/rate-limit"

export const runtime = "nodejs"

interface CheckoutItemInput {
  id: string
  slug: string
  name: string
  quantity: number
  price?: number
  size?: string
  color?: string
}

interface CheckoutRequestBody {
  contact: {
    name: string
    email: string
    phone: string
  }
  address: {
    street: string
    city: string
    state: string
    country: string
  }
  paymentMethod: string
  notes?: string
  items: CheckoutItemInput[]
}

function normalizeItemId(id: string) {
  return id.split("_")[0]
}

const processedOrderIds = new Set<string>()

export async function POST(request: Request) {
  let body: CheckoutRequestBody

  try {
    body = (await request.json()) as CheckoutRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const idempotencyKey = request.headers.get("Idempotency-Key") || request.headers.get("idempotency-key")

  if (idempotencyKey) {
    if (processedOrderIds.has(idempotencyKey)) {
      return NextResponse.json({ error: "Duplicate request" }, { status: 409 })
    }
    processedOrderIds.add(idempotencyKey)
    setTimeout(() => processedOrderIds.delete(idempotencyKey), 86_400_000)
  }

  const rateCheck = checkRateLimit(rateLimitKey("checkout", ip), { maxRequests: 5, windowMs: 60_000 })
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  const contactErrors = validateCheckoutContact(body.contact)
  const addressErrors = validateCheckoutAddress(body.address)
  const itemErrors = validateOrderItems(body.items)
  const paymentError = validateEnum(body.paymentMethod, ALLOWED_PAYMENT_METHODS, "Payment method")
  const errors = [...contactErrors, ...addressErrors, ...itemErrors]
  if (paymentError) errors.push(paymentError)

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 })
  }

  const url = new URL(request.url)
  const isSimulation = url.searchParams.get("simulation") === "true" && process.env.NODE_ENV !== "production"

  const userClient = createRouteSupabaseClient(request)
  const serviceClient = createServiceSupabaseClient()

  const { data: sessionData } = await userClient.auth.getSession()
  const user = sessionData.session?.access_token ? (await userClient.auth.getUser()).data.user : null

  let normalizedItems: {
    product_id: string
    name: string
    quantity: number
    price: number
    size: string | null
    color: string | null
  }[]

  let productMap: Map<string, Record<string, unknown>> | null = null

  if (isSimulation) {
    normalizedItems = body.items.map((item) => ({
      product_id: normalizeItemId(item.id),
      name: sanitizeString(item.name, 200),
      quantity: item.quantity,
      price: Number(item.price) || 0,
      size: sanitizeString(item.size || "", 50) || null,
      color: sanitizeString(item.color || "", 50) || null,
    }))
  } else {
    const productIds = body.items.map((item) => normalizeItemId(item.id))
    const { data: products, error: productsError } = await serviceClient
      .from("products")
      .select("id, name, slug, price, in_stock, stock_qty, low_stock_threshold")
      .in("id", productIds)

    if (productsError) {
      return NextResponse.json({ error: "Failed to verify product availability" }, { status: 500 })
    }

    productMap = new Map((products || []).map((product) => [product.id, product]))
    const missingProducts = productIds.filter((id) => !productMap!.has(id))
    if (missingProducts.length > 0) {
      return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 })
    }

    for (const item of body.items) {
      const product = productMap.get(normalizeItemId(item.id))
      if (!product) continue
      const available = Number(product.stock_qty)
      if (available < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for "${product.name}". Available: ${available}, requested: ${item.quantity}`,
        }, { status: 400 })
      }
    }

    normalizedItems = body.items.map((item) => {
      const product = productMap!.get(normalizeItemId(item.id))! as Record<string, unknown>
      return {
        product_id: String(product.id),
        name: sanitizeString(product.name, 200),
        quantity: item.quantity,
        price: Number(product.price),
        size: sanitizeString(String(item.size || ""), 50) || null,
        color: sanitizeString(String(item.color || ""), 50) || null,
      }
    })
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 150000 ? 0 : 5000
  const total = subtotal + shipping
  const now = new Date().toISOString()
  const prefix = isSimulation ? "SIM" : "YSI"
  const orderNumber = `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

  let customerId: string

  if (user) {
    customerId = user.id
    const { data: existingCustomer, error: fetchError } = await serviceClient
      .from("customers")
      .select("total_orders, total_spent")
      .eq("id", user.id)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: "Failed to verify customer record" }, { status: 500 })
    }

    if (existingCustomer) {
      const { error: updateError } = await serviceClient
        .from("customers")
        .update({
          name: sanitizeString(body.contact.name, 200),
          phone: sanitizePhone(body.contact.phone),
          total_orders: Number(existingCustomer.total_orders || 0) + 1,
          total_spent: Number(existingCustomer.total_spent || 0) + total,
        })
        .eq("id", user.id)

      if (updateError) {
        return NextResponse.json({ error: "Failed to update customer record" }, { status: 500 })
      }
    } else {
      const { error: insertError } = await serviceClient
        .from("customers")
        .insert({
          id: user.id,
          name: sanitizeString(body.contact.name, 200),
          email: user.email,
          phone: sanitizePhone(body.contact.phone),
          status: "active",
          total_orders: 1,
          total_spent: total,
        })

      if (insertError) {
        return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 })
      }
    }
  } else {
    const customerPayload = {
      name: sanitizeString(body.contact.name, 200),
      email: sanitizeEmail(body.contact.email),
      phone: sanitizePhone(body.contact.phone),
      status: "active",
      address: {
        street: sanitizeString(body.address.street, 200),
        city: sanitizeString(body.address.city, 120),
        state: sanitizeString(body.address.state, 120),
        country: sanitizeString(body.address.country, 120),
      },
    }

    const { data: existingCustomer, error: existingCustomerError } = await serviceClient
      .from("customers")
      .select("id, total_orders, total_spent")
      .eq("email", customerPayload.email)
      .maybeSingle()

    if (existingCustomerError) {
      return NextResponse.json({ error: "Failed to verify customer record" }, { status: 500 })
    }

    if (existingCustomer) {
      customerId = existingCustomer.id
      const { error: updateError } = await serviceClient
        .from("customers")
        .update({
          total_orders: Number(existingCustomer.total_orders || 0) + 1,
          total_spent: Number(existingCustomer.total_spent || 0) + total,
        })
        .eq("id", existingCustomer.id)

      if (updateError) {
        return NextResponse.json({ error: "Failed to update customer record" }, { status: 500 })
      }
    } else {
      const { data: insertedCustomer, error: insertError } = await serviceClient
        .from("customers")
        .insert({
          ...customerPayload,
          total_orders: 1,
          total_spent: total,
        })
        .select("id")
        .maybeSingle()

      if (insertError || !insertedCustomer) {
        return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 })
      }

      customerId = insertedCustomer.id
    }
  }

  const notes = isSimulation
    ? `[SIMULATION] ${sanitizeString(body.notes || "", 2000)}`
    : sanitizeString(body.notes || "", 2000)

  const { data: orderResult, error: orderRpcError } = await serviceClient.rpc("place_order", {
    p_order_number: orderNumber,
    p_customer_id: customerId,
    p_subtotal: subtotal,
    p_shipping: shipping,
    p_total: total,
    p_payment_method: body.paymentMethod,
    p_shipping_address: {
      street: sanitizeString(body.address.street, 200),
      city: sanitizeString(body.address.city, 120),
      state: sanitizeString(body.address.state, 120),
      country: sanitizeString(body.address.country, 120),
    },
    p_notes: notes,
    p_items: normalizedItems.map((item) => ({
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size || "",
      color: item.color || "",
    })),
    p_now: now,
  })

  if (orderRpcError) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }

  const result = orderResult as Record<string, unknown> | undefined
  if (!result || result.error) {
    return NextResponse.json({ error: String((result as Record<string, unknown>)?.error || "Order creation failed") }, { status: 500 })
  }

  const orderId = result.order_id as string

  if (productMap) {
    for (const item of normalizedItems) {
      const product = productMap.get(item.product_id)
      if (!product) continue
      const currentStock = Number(product.stock_qty)
      const { error: stockError } = await serviceClient
        .from("products")
        .update({ stock_qty: Math.max(0, currentStock - item.quantity) })
        .eq("id", item.product_id)

      if (stockError) {
        console.error(`Failed to decrement stock for product ${item.product_id}:`, stockError)
      }
    }
  }

  return NextResponse.json({
    ok: true,
    orderNumber,
    total,
    authenticated: Boolean(user),
  })
}
