export const ALLOWED_CATEGORIES = [
  "Bespoke", "Evening Wear", "Ready-to-Wear", "Wedding", "Corporate",
  "Traditional Wear", "Casual Essentials", "Luxury Evening Wear", "Accessories",
] as const

export const ALLOWED_GENDERS = ["men", "women", "unisex"] as const
export const ALLOWED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46"] as const
export const ALLOWED_COLORS = ["Jet Black", "Pure White", "Navy", "Charcoal", "Cream", "Stone Gray", "Sky Blue", "Cognac", "Camel", "Ivory", "Champagne", "Gold", "Emerald", "Burgundy"] as const
export const ALLOWED_SEASONS = ["All Season", "Spring/Summer", "Fall/Winter"] as const
export const ALLOWED_OCCASIONS = ["Corporate", "Evening", "Wedding", "Casual", "Traditional"] as const
export const ALLOWED_COUNTRIES = ["Nigeria", "Ghana", "United Kingdom", "United States"] as const
export const ALLOWED_PAYMENT_METHODS = ["cash-on-delivery"] as const
export const ALLOWED_ORDER_STATUSES = ["pending", "confirmed", "tailoring", "quality-check", "shipped", "delivered", "cancelled"] as const
export const ALLOWED_INVENTORY_LOG_TYPES = ["restock", "adjustment", "return", "sale"] as const

const ALLOWED_PRODUCT_COLUMNS = new Set([
  "id", "name", "slug", "description", "category", "gender", "subcategory", "price", "compare_at_price",
  "original_price", "images", "fabric", "sizes", "colors", "tags", "featured", "in_stock",
  "stock_qty", "low_stock_threshold", "is_new", "is_bestseller", "season", "occasion", "style",
  "tailoring_notes", "tailoringNotes", "delivery_estimate", "created_at", "updated_at",
])

const ALLOWED_ORDER_COLUMNS = new Set([
  "id", "order_number", "customer_id", "status", "subtotal", "shipping", "total",
  "payment_method", "payment_status", "shipping_address", "notes", "created_at", "updated_at",
])

const ALLOWED_TABLES = new Set([
  "products", "orders", "order_items", "order_timeline", "customers",
  "admin_users", "inventory_logs",
])

const ALLOWED_ADMIN_USER_COLUMNS = new Set([
  "id", "auth_user_id", "name", "email", "avatar_url", "role", "phone", "created_at", "updated_at",
])

const ALLOWED_INVENTORY_LOG_COLUMNS = new Set([
  "id", "product_id", "type", "quantity", "previous_stock", "new_stock", "note", "performed_by", "created_at",
])

const ALLOWED_ORDER_ITEM_COLUMNS = new Set([
  "id", "order_id", "product_id", "name", "quantity", "price", "size", "color", "created_at",
])

const ALLOWED_ORDER_TIMELINE_COLUMNS = new Set([
  "id", "order_id", "status", "note", "created_at",
])

const ALLOWED_CUSTOMER_COLUMNS = new Set([
  "id", "name", "email", "phone", "avatar_url", "total_orders", "total_spent", "status", "notes", "address", "created_at", "updated_at",
])

const ALLOWED_RPC_FUNCTIONS = new Set(["get_admin_by_auth_id"])

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[\d\s\-\+\(\)]{6,20}$/
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "")
}

export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return ""
  let s = stripHtml(input.trim())
  if (s.length > maxLength) s = s.slice(0, maxLength)
  return s
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") return ""
  return input.trim().toLowerCase()
}

export function sanitizePhone(input: unknown): string {
  if (typeof input !== "string") return ""
  return input.trim().replace(/[^\d\s\-\+\(\)]/g, "")
}

export function sanitizeSlug(input: unknown): string {
  if (typeof input !== "string") return ""
  return input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-")
}

export function sanitizeFilename(filename: string): string {
  const ext = filename.split(".").pop() || ""
  const name = filename.slice(0, filename.length - ext.length - 1)
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100)
  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)
  return safeExt ? `${safeName}.${safeExt}` : safeName
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxBytes: number): boolean {
  return file.size <= maxBytes
}

export function isValidEmail(input: unknown): input is string {
  return typeof input === "string" && EMAIL_REGEX.test(input.trim())
}

export function isValidPhone(input: unknown): input is string {
  return typeof input === "string" && PHONE_REGEX.test(input.trim())
}

export function isValidSlug(input: unknown): input is string {
  return typeof input === "string" && SLUG_REGEX.test(input)
}

export function isValidColumnName(column: string, table: string): boolean {
  const sets: Record<string, Set<string>> = {
    products: ALLOWED_PRODUCT_COLUMNS,
    orders: ALLOWED_ORDER_COLUMNS,
    admin_users: ALLOWED_ADMIN_USER_COLUMNS,
    inventory_logs: ALLOWED_INVENTORY_LOG_COLUMNS,
    order_items: ALLOWED_ORDER_ITEM_COLUMNS,
    order_timeline: ALLOWED_ORDER_TIMELINE_COLUMNS,
    customers: ALLOWED_CUSTOMER_COLUMNS,
  }
  const allowed = sets[table] || new Set()
  return allowed.has(column)
}

export function isValidTable(table: string): boolean {
  return ALLOWED_TABLES.has(table)
}

export function isValidRpcFunction(fn: string): boolean {
  return ALLOWED_RPC_FUNCTIONS.has(fn)
}

export function validateNonNullString(value: unknown, fieldName: string): string | null {
  const s = sanitizeString(value)
  if (!s) return `${fieldName} is required`
  return null
}

export function validateEnum<T extends readonly string[]>(value: unknown, allowed: T, fieldName: string): string | null {
  if (typeof value !== "string" || !allowed.includes(value as T[number])) {
    return `${fieldName} must be one of: ${allowed.join(", ")}`
  }
  return null
}

export function validatePositiveNumber(value: unknown, fieldName: string): string | null {
  if (typeof value !== "number" || isNaN(value) || value < 0) {
    return `${fieldName} must be a non-negative number`
  }
  return null
}

export function validateId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 64
}

export function validateProductInput(values: Record<string, unknown>, isUpdate = false): string[] {
  const errors: string[] = []

  if (!isUpdate) {
    const nameErr = validateNonNullString(values.name, "Product name")
    if (nameErr) errors.push(nameErr)
  } else {
    if (values.name !== undefined) {
      const nameErr = validateNonNullString(values.name, "Product name")
      if (nameErr) errors.push(nameErr)
    }
  }

  if (values.price !== undefined) {
    const priceErr = validatePositiveNumber(values.price, "Price")
    if (priceErr) errors.push(priceErr)
  }

  if (values.category !== undefined) {
    const catErr = validateEnum(values.category, ALLOWED_CATEGORIES, "Category")
    if (catErr) errors.push(catErr)
  }

  if (values.gender !== undefined) {
    const genderErr = validateEnum(values.gender, ALLOWED_GENDERS, "Gender")
    if (genderErr) errors.push(genderErr)
  }

  if (values.season !== undefined && values.season !== null && values.season !== "") {
    const seasonErr = validateEnum(values.season, ALLOWED_SEASONS, "Season")
    if (seasonErr) errors.push(seasonErr)
  }

  if (values.occasion !== undefined && values.occasion !== null && values.occasion !== "") {
    const occasionErr = validateEnum(values.occasion, ALLOWED_OCCASIONS, "Occasion")
    if (occasionErr) errors.push(occasionErr)
  }

  if (values.stock_qty !== undefined || values.stock_quantity !== undefined) {
    const qty = values.stock_qty ?? values.stock_quantity
    if (typeof qty === "number" && (isNaN(qty) || qty < 0 || !Number.isInteger(qty))) {
      errors.push("Stock quantity must be a non-negative integer")
    }
  }

  if (values.low_stock_threshold !== undefined) {
    if (typeof values.low_stock_threshold !== "number" || isNaN(values.low_stock_threshold) || values.low_stock_threshold < 1 || !Number.isInteger(values.low_stock_threshold)) {
      errors.push("Low stock threshold must be a positive integer")
    }
  }

  if (values.compare_at_price !== undefined && values.compare_at_price !== null) {
    if (typeof values.compare_at_price !== "number" || isNaN(values.compare_at_price) || values.compare_at_price < 0) {
      errors.push("Compare at price must be a non-negative number")
    }
  }

  if (values.original_price !== undefined && values.original_price !== null) {
    if (typeof values.original_price !== "number" || isNaN(values.original_price) || values.original_price < 0) {
      errors.push("Original price must be a non-negative number")
    }
  }

  if (values.colors !== undefined && Array.isArray(values.colors)) {
    for (const c of values.colors) {
      if (typeof c !== "string" || !(ALLOWED_COLORS as readonly string[]).includes(c)) {
        errors.push(`Invalid color: ${c}`)
        break
      }
    }
  }

  if (values.sizes !== undefined && Array.isArray(values.sizes)) {
    for (const s of values.sizes) {
      if (typeof s !== "string" || !(ALLOWED_SIZES as readonly string[]).includes(s)) {
        errors.push(`Invalid size: ${s}`)
        break
      }
    }
  }

  if (values.description !== undefined && typeof values.description === "string" && values.description.length > 5000) {
    errors.push("Description must be under 5000 characters")
  }

  return errors
}

export function validateCheckoutContact(contact: unknown): string[] {
  const errors: string[] = []
  if (!contact || typeof contact !== "object") return ["Contact information is required"]

  const c = contact as Record<string, unknown>

  const nameErr = validateNonNullString(c.name, "Full name")
  if (nameErr) errors.push(nameErr)

  const email = sanitizeEmail(c.email)
  if (!email) errors.push("Email is required")
  else if (!isValidEmail(email)) errors.push("Please enter a valid email address")

  const phone = sanitizePhone(c.phone)
  if (!phone) errors.push("Phone number is required")
  else if (!isValidPhone(phone)) errors.push("Please enter a valid phone number")

  return errors
}

export function validateCheckoutAddress(address: unknown): string[] {
  const errors: string[] = []
  if (!address || typeof address !== "object") return ["Delivery address is required"]

  const a = address as Record<string, unknown>

  const streetErr = validateNonNullString(a.street, "Street address")
  if (streetErr) errors.push(streetErr)

  const cityErr = validateNonNullString(a.city, "City")
  if (cityErr) errors.push(cityErr)

  if (a.country !== undefined && a.country !== "") {
    const countryErr = validateEnum(a.country, ALLOWED_COUNTRIES, "Country")
    if (countryErr) errors.push(countryErr)
  }

  return errors
}

export function validateOrderItems(items: unknown): string[] {
  const errors: string[] = []
  if (!Array.isArray(items) || items.length === 0) return ["Cart is empty"]

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item || typeof item !== "object") {
      errors.push(`Item at index ${i} is invalid`)
      continue
    }
    const it = item as Record<string, unknown>
    const nameErr = validateNonNullString(it.name, `Item ${i + 1} name`)
    if (nameErr) errors.push(nameErr)
    if (typeof it.quantity !== "number" || it.quantity < 1 || !Number.isInteger(it.quantity)) {
      errors.push(`Item ${i + 1} quantity must be a positive integer`)
    }
    if (typeof it.price !== "number" || it.price < 0) {
      errors.push(`Item ${i + 1} price must be a non-negative number`)
    }
  }

  return errors
}

export function validateRestockQuantity(quantity: unknown): string | null {
  if (typeof quantity !== "number" || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    return "Restock quantity must be a positive integer"
  }
  return null
}

export function validateOrderStatusUpdate(status: unknown): string | null {
  return validateEnum(status, ALLOWED_ORDER_STATUSES, "Status")
}

export function validateSettings(values: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (values.name !== undefined) {
    const nameErr = validateNonNullString(values.name, "Store name")
    if (nameErr) errors.push(nameErr)
  }
  if (values.email !== undefined) {
    const email = sanitizeEmail(values.email)
    if (!email || !isValidEmail(email)) errors.push("Please enter a valid email address")
  }
  if (values.phone !== undefined) {
    const phone = sanitizePhone(values.phone)
    if (phone && !isValidPhone(phone)) errors.push("Please enter a valid phone number")
  }
  if (values.freeShippingThreshold !== undefined) {
    const num = Number(values.freeShippingThreshold)
    if (isNaN(num) || num < 0) errors.push("Free shipping threshold must be a non-negative number")
  }
  if (values.flatShippingRate !== undefined) {
    const num = Number(values.flatShippingRate)
    if (isNaN(num) || num < 0) errors.push("Flat shipping rate must be a non-negative number")
  }
  return errors
}

export function sanitizeProductValues(values: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(values)) {
    if (!isValidColumnName(key, "products")) continue
    if (typeof value === "string" && key !== "description" && key !== "tailoring_notes" && key !== "tailoringNotes") {
      sanitized[key] = sanitizeString(value, key === "description" ? 5000 : 200)
    } else if (typeof value === "string" && (key === "description" || key === "tailoring_notes" || key === "tailoringNotes")) {
      sanitized[key] = sanitizeString(value, 5000)
    } else if (typeof value === "number") {
      sanitized[key] = isNaN(value) ? 0 : value
    } else if (typeof value === "boolean") {
      sanitized[key] = value
    } else if (Array.isArray(value)) {
      sanitized[key] = value.filter((v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    } else if (value === null) {
      sanitized[key] = null
    }
  }
  return sanitized
}
