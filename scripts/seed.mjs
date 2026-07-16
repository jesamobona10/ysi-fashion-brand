/**
 * YSI E-commerce — Seed Script
 *
 * Populates the database with demo products, customers, orders, and admin user.
 *
 * Usage:
 *   1. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   2. Run: node scripts/seed.mjs
 *
 * Prerequisites:
 *   - All 7 migrations must have been run via the Supabase SQL Editor
 *   - The product-images storage bucket must exist
 */

import { readFileSync, existsSync } from "fs"
import { createHash } from "crypto"

function loadEnv() {
  const envPath = ".env.local"
  if (!existsSync(envPath)) {
    console.error("❌ .env.local not found. Create it with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }
  const text = readFileSync(envPath, "utf-8")
  const env = {}
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

const env = loadEnv()
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
  process.exit(1)
}

const BASE = `${URL}/rest/v1`
const HEADERS = {
  "Content-Type": "application/json",
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  Prefer: "resolution=merge-duplicates",
}

const uuid = (s) => {
  const h = createHash("md5").update(s).digest("hex")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`
}

async function insert(table, body) {
  const r = await fetch(`${BASE}/${table}`, { method: "POST", headers: HEADERS, body: JSON.stringify(body) })
  const ok = r.ok || r.status === 409
  if (!ok) {
    const text = (await r.text()).slice(0, 200)
    console.error(`  ✗ ${table}: HTTP ${r.status} ${text}`)
  }
  return ok
}

async function upsert(table, body, onConflict) {
  const params = onConflict ? `?on_conflict=${onConflict}` : ""
  const r = await fetch(`${BASE}/${table}${params}`, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(body),
  })
  const ok = r.ok || r.status === 409
  if (!ok) {
    const text = (await r.text()).slice(0, 200)
    console.error(`  ✗ ${table}: HTTP ${r.status} ${text}`)
  }
  return ok
}

async function countTable(table) {
  try {
    const r = await fetch(`${BASE}/${table}?select=count`, { headers: { ...HEADERS, Prefer: "count=exact" } })
    if (!r.ok) return "ERROR"
    const count = r.headers.get("content-range")?.split("/")[1] || "?"
    return count
  } catch { return "ERROR" }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Products ────────────────────────────────────────────────────────────────

const products = [
  { name: "The Executive Tailored Blazer", slug: "executive-tailored-blazer", category: "Bespoke", gender: "men", price: 850000, original_price: 950000, description: "A masterfully constructed single-breasted blazer cut from Italian wool blend. Features notched lapels, structured shoulders, and flap pockets.", images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80"], fabric: "Italian Wool Blend", sizes: ["38","40","42","44","46"], colors: ["Charcoal","Navy","Black"], in_stock: true, stock_qty: 15, low_stock_threshold: 5, is_new: true, is_bestseller: true, season: "All Season", occasion: "Corporate", style: "Classic", tailoring_notes: "Fully canvassed construction with hand-stitched lapels and horn buttons.", delivery_estimate: "7-14 business days", rating: 4.8, review_count: 24 },
  { name: "The Opulent Evening Gown", slug: "opulent-evening-gown", category: "Evening Wear", gender: "women", price: 1200000, original_price: 1500000, description: "An enchanting floor-length gown in silk crepe de Chine. Features a plunging V-neck, open back, and a sweeping train.", images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80"], fabric: "Silk Crepe de Chine", sizes: ["XS","S","M","L","XL"], colors: ["Midnight Blue","Burgundy","Emerald"], in_stock: true, stock_qty: 8, low_stock_threshold: 3, is_new: true, is_bestseller: true, season: "Fall/Winter", occasion: "Evening", style: "Editorial", tailoring_notes: "Hand-beaded bodice with French seam finishing.", delivery_estimate: "14-21 business days", rating: 4.9, review_count: 31 },
  { name: "The Couture Tuxedo", slug: "couture-tuxedo", category: "Bespoke", gender: "men", price: 1800000, original_price: 2200000, description: "The pinnacle of formalwear. Crafted from Super 120s wool with satin peak lapels, this tuxedo redefines black-tie elegance.", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80", "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80"], fabric: "Super 120s Wool", sizes: ["38","40","42","44","46"], colors: ["Black","Midnight Blue"], in_stock: true, stock_qty: 5, low_stock_threshold: 2, is_bestseller: true, season: "All Season", occasion: "Wedding", style: "Classic", tailoring_notes: "Silk satin lapels with hand-bound buttonholes and grosgrain trim.", delivery_estimate: "14-21 business days", rating: 5.0, review_count: 18 },
  { name: "The Aso Oke Bridal Corset", slug: "aso-oke-bridal-corset", category: "Wedding", gender: "women", price: 950000, original_price: 1100000, description: "A breathtaking corset top handcrafted from French lace and handwoven Aso Oke.", images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80", "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600&q=80"], fabric: "French Lace & Silk", sizes: ["XS","S","M","L","XL"], colors: ["Ivory","Champagne","Blush"], in_stock: true, stock_qty: 6, low_stock_threshold: 2, is_new: true, season: "Spring/Summer", occasion: "Wedding", style: "Romantic", tailoring_notes: "Hand-beaded French lace overlay with silk organza underlay.", delivery_estimate: "21-28 business days", rating: 4.7, review_count: 15 },
  { name: "The Lagos Luxe Kaftan", slug: "lagos-luxe-kaftan", category: "Traditional Wear", gender: "women", price: 650000, original_price: 780000, description: "A reimagined classic. Flowing silk crepe kaftan with hand-embroidered neckline and side slits.", images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80"], fabric: "Silk Crepe de Chine", sizes: ["S","M","L","XL","XXL"], colors: ["Gold","Emerald","Royal Blue"], in_stock: true, stock_qty: 12, low_stock_threshold: 3, is_new: true, is_bestseller: true, season: "All Season", occasion: "Casual", style: "Modern Classic", tailoring_notes: "Hand-embroidered Swarovski crystal detailing at neckline.", delivery_estimate: "7-14 business days", rating: 4.6, review_count: 22 },
  { name: "The Precision Tailored Trousers", slug: "precision-tailored-trousers", category: "Ready-to-Wear", gender: "men", price: 350000, original_price: 420000, description: "Sharp, modern trousers in premium Italian wool. Flat front with side adjusters and a tapered leg.", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"], fabric: "Italian Wool", sizes: ["28","30","32","34","36","38","40","42"], colors: ["Charcoal","Navy","Beige"], in_stock: true, stock_qty: 25, low_stock_threshold: 5, season: "All Season", occasion: "Corporate", style: "Classic", delivery_estimate: "5-10 business days", rating: 4.5, review_count: 30 },
  { name: "The Velvet Smoking Jacket", slug: "velvet-smoking-jacket", category: "Luxury Evening Wear", gender: "men", price: 1350000, original_price: 1600000, description: "Luxurious silk velvet smoking jacket with shawl collar and contrast satin lapels.", images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"], fabric: "Silk Velvet", sizes: ["38","40","42","44","46"], colors: ["Burgundy","Forest Green","Midnight Blue"], in_stock: true, stock_qty: 7, low_stock_threshold: 2, is_bestseller: true, season: "Fall/Winter", occasion: "Evening", style: "Luxury", tailoring_notes: "Silk satin lapels with quilted lining and jetted pockets.", delivery_estimate: "14-21 business days", rating: 4.9, review_count: 12 },
  { name: "The Cashmere Overcoat", slug: "cashmere-overcoat", category: "Casual Essentials", gender: "men", price: 2200000, original_price: 2800000, description: "An investment piece for the discerning gentleman. Double-breasted overcoat in pure Mongolian cashmere.", images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80"], fabric: "Mongolian Cashmere", sizes: ["38","40","42","44","46"], colors: ["Camel","Charcoal","Black"], in_stock: true, stock_qty: 4, low_stock_threshold: 2, is_new: true, season: "Fall/Winter", occasion: "Casual", style: "Contemporary Heritage", delivery_estimate: "14-21 business days", rating: 5.0, review_count: 9 },
  { name: "The Leather Weekender", slug: "leather-weekender", category: "Accessories", gender: "unisex", price: 750000, original_price: 850000, description: "Handcrafted full-grain Italian leather duffle bag with brass hardware.", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"], fabric: "Full-Grain Italian Leather", sizes: ["One Size"], colors: ["Tan","Black","Brown"], in_stock: true, stock_qty: 10, low_stock_threshold: 3, season: "All Season", occasion: "Casual", style: "Minimalist", delivery_estimate: "7-14 business days", rating: 4.7, review_count: 20 },
  { name: "The Relaxed Linen Suit", slug: "relaxed-linen-suit", category: "Ready-to-Wear", gender: "unisex", price: 550000, original_price: 680000, description: "Unconstructed linen suit in a relaxed silhouette. Jacket and trousers set.", images: ["https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"], fabric: "Premium Linen", sizes: ["S","M","L","XL","XXL"], colors: ["Ecru","Slate","Sage"], in_stock: true, stock_qty: 18, low_stock_threshold: 5, season: "Spring/Summer", occasion: "Corporate", style: "Relaxed", delivery_estimate: "7-14 business days", rating: 4.4, review_count: 16 },
]

// ─── Customers ───────────────────────────────────────────────────────────────

const customers = [
  { name: "Amara Okafor", email: "amara.okafor@example.com", phone: "+234-801-234-5678", status: "vip", notes: "Regular bespoke client. Prefers appointments on Saturdays." },
  { name: "David Kalu", email: "david.kalu@example.com", phone: "+234-802-345-6789", status: "vip", notes: "Corporate client. Orders bulk suits quarterly." },
  { name: "Chioma Eze", email: "chioma.eze@example.com", phone: "+234-803-456-7890", status: "active" },
  { name: "Tunde Adebayo", email: "tunde.adebayo@example.com", phone: "+234-804-567-8901", status: "active" },
  { name: "Zara Mensah", email: "zara.mensah@example.com", phone: "+233-501-234-567", status: "active", notes: "International client. Ships to Accra." },
  { name: "Michael Adewale", email: "michael.adewale@example.com", phone: "+234-805-678-9012", status: "vip" },
  { name: "Sarah Johnson", email: "sarah.johnson@example.com", phone: "+234-806-789-0123", status: "active", notes: "Bridal client." },
  { name: "Ngozi Franklin", email: "ngozi.franklin@example.com", phone: "+234-807-890-1234", status: "inactive" },
]

const orders = [
  { order_number: "YSI-2026-001", customer_email: "amara.okafor@example.com", status: "delivered", subtotal: 1130000, shipping: 0, total: 1130000, payment_method: "bank-transfer", payment_status: "paid", items: [{ slug: "executive-tailored-blazer", name: "The Executive Tailored Blazer", quantity: 1, price: 850000, size: "42", color: "Charcoal" }, { slug: "lagos-luxe-kaftan", name: "The Lagos Luxe Kaftan", quantity: 1, price: 650000, size: "M", color: "Gold" }] },
  { order_number: "YSI-2026-002", customer_email: "chioma.eze@example.com", status: "delivered", subtotal: 1200000, shipping: 0, total: 1200000, payment_method: "bank-transfer", payment_status: "paid", items: [{ slug: "opulent-evening-gown", name: "The Opulent Evening Gown", quantity: 1, price: 1200000, size: "M", color: "Burgundy" }] },
  { order_number: "YSI-2026-003", customer_email: "david.kalu@example.com", status: "shipped", subtotal: 700000, shipping: 5000, total: 705000, payment_method: "paystack", payment_status: "paid", items: [{ slug: "precision-tailored-trousers", name: "The Precision Tailored Trousers", quantity: 2, price: 350000, size: "34", color: "Navy" }] },
  { order_number: "YSI-2026-004", customer_email: "tunde.adebayo@example.com", status: "quality-check", subtotal: 850000, shipping: 0, total: 850000, payment_method: "paystack", payment_status: "paid", items: [{ slug: "executive-tailored-blazer", name: "The Executive Tailored Blazer", quantity: 1, price: 850000, size: "42", color: "Navy" }] },
  { order_number: "YSI-2026-005", customer_email: "zara.mensah@example.com", status: "pending", subtotal: 950000, shipping: 30000, total: 980000, payment_method: "cash-on-delivery", payment_status: "pending", items: [{ slug: "aso-oke-bridal-corset", name: "The Aso Oke Bridal Corset", quantity: 1, price: 950000, size: "M", color: "Champagne" }] },
  { order_number: "YSI-2026-006", customer_email: "amara.okafor@example.com", status: "confirmed", subtotal: 1800000, shipping: 0, total: 1800000, payment_method: "bank-transfer", payment_status: "paid", items: [{ slug: "couture-tuxedo", name: "The Couture Tuxedo", quantity: 1, price: 1800000, size: "42", color: "Black" }] },
  { order_number: "YSI-2026-007", customer_email: "michael.adewale@example.com", status: "tailoring", subtotal: 1350000, shipping: 0, total: 1350000, payment_method: "bank-transfer", payment_status: "paid", items: [{ slug: "velvet-smoking-jacket", name: "The Velvet Smoking Jacket", quantity: 1, price: 1350000, size: "42", color: "Burgundy" }] },
  { order_number: "YSI-2026-008", customer_email: "sarah.johnson@example.com", status: "pending", subtotal: 2200000, shipping: 0, total: 2200000, payment_method: "paystack", payment_status: "pending", items: [{ slug: "cashmere-overcoat", name: "The Cashmere Overcoat", quantity: 1, price: 2200000, size: "40", color: "Camel" }] },
]

const inventoryLogs = [
  { slug: "executive-tailored-blazer", type: "restock", quantity: 10, previous_stock: 5, new_stock: 15, note: "Initial stock" },
  { slug: "opulent-evening-gown", type: "restock", quantity: 8, previous_stock: 0, new_stock: 8, note: "Initial stock" },
  { slug: "cou-ture-tuxedo", type: "restock", quantity: 5, previous_stock: 0, new_stock: 5, note: "Initial stock" },
  { slug: "leather-weekender", type: "restock", quantity: 10, previous_stock: 0, new_stock: 10, note: "Initial stock" },
  { slug: "relaxed-linen-suit", type: "restock", quantity: 18, previous_stock: 0, new_stock: 18, note: "Initial stock" },
]

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("")
  console.log("  ╔══════════════════════════════════════════╗")
  console.log("  ║      YSI E-commerce — Seed Script        ║")
  console.log("  ╚══════════════════════════════════════════╝")
  console.log("")

  console.log("  ── Products ──")
  const productIds = {}
  for (const p of products) {
    const id = uuid(p.slug)
    productIds[p.slug] = id
    const ok = await insert("products", { id, ...p })
    console.log(`  ${ok ? "✓" : "✗"} ${p.name}`)
  }

  await sleep(300)

  console.log("\n  ── Customers ──")
  const customerIds = {}
  for (const c of customers) {
    const id = uuid(c.email)
    customerIds[c.email] = id
    const ok = await insert("customers", { id, ...c })
    console.log(`  ${ok ? "✓" : "✗"} ${c.name}`)
  }

  await sleep(300)

  console.log("\n  ── Orders ──")
  for (const order of orders) {
    const orderId = uuid(order.order_number)
    const cid = customerIds[order.customer_email]
    if (!cid) { console.log(`  ✗ ${order.order_number}: customer not found`); continue }

    const { customer_email, items, ...orderData } = order
    const ok = await insert("orders", { id: orderId, customer_id: cid, ...orderData })
    console.log(`  ${ok ? "✓" : "✗"} ${order.order_number}`)

    if (ok && items) {
      for (const item of items) {
        const { slug, ...itemData } = item
        const pid = productIds[slug]
        const itemId = uuid(`${order.order_number}-${slug}`)
        await insert("order_items", { id: itemId, order_id: orderId, product_id: pid, ...itemData })
      }
      await insert("order_timeline", {
        id: uuid(`${order.order_number}-created`),
        order_id: orderId,
        status: orderData.status,
        note: "Order placed",
      })
    }
  }

  await sleep(300)

  console.log("\n  ── Inventory Logs ──")
  for (const log of inventoryLogs) {
    const pid = productIds[log.slug]
    if (!pid) { console.log(`  ✗ ${log.slug}: product not found`); continue }
    const { slug, ...logData } = log
    await insert("inventory_logs", { id: uuid(`inv-${log.slug}`), product_id: pid, ...logData })
    console.log(`  ✓ ${log.slug}`)
  }

  console.log("")
  console.log("  ── Verification ──")
  for (const table of ["products", "customers", "orders", "order_items", "order_timeline", "inventory_logs"]) {
    const count = await countTable(table)
    console.log(`  ${table}: ${count} rows`)
  }

  console.log("")
  console.log("  Done. 🎉")
  console.log("")
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
