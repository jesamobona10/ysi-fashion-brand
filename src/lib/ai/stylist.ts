import { type Occasion, type Vibe, OCCASION_STYLE_MAP } from "./constants"

export interface OutfitItem {
  productId: string
  slug: string
  name: string
  price: number
  image: string
  category: string
  color: string
  fabric?: string
}

export interface StyledOutfit {
  id: string
  name: string
  description: string
  styleNotes: string
  items: OutfitItem[]
  totalPrice: number
}

export interface StylistRequest {
  occasion: Occasion
  vibe: Vibe
  gender: string
  description?: string
}

interface ProductRecord {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
  colors: string[]
  fabric: string
  description: string
  gender: string
  occasion: string
  style: string
  tags: string[]
  season: string
}

const CATEGORY_ROLES = [
  { role: "top", keywords: ["shirt", "blouse", "top", "jacket", "blazer", "bomber", "vest", "turtleneck"] },
  { role: "bottom", keywords: ["trouser", "pant", "skirt", "shorts", "jeans", "chino"] },
  { role: "outerwear", keywords: ["coat", "jacket", "blazer", "cardigan", "kimono", "duster"] },
  { role: "full", keywords: ["dress", "gown", "jumpsuit", "agaada", "agbada", "senator", "dashiki"] },
  { role: "footwear", keywords: ["shoe", "sneaker", "loafer", "boot", "heel", "sandal"] },
  { role: "accessory", keywords: ["bag", "belt", "hat", "scarf", "watch", "jewelry", "tie", "bowtie", "pocket square"] },
]

function detectRole(category: string, name: string): string {
  const lower = `${category} ${name}`.toLowerCase()
  for (const r of CATEGORY_ROLES) {
    if (r.keywords.some((k) => lower.includes(k))) return r.role
  }
  return "other"
}

const OCCASION_TEXTURES: Record<string, string[]> = {
  corporate: ["Wool", "Cotton", "Linen", "Silk"],
  wedding: ["Silk", "Satin", "Lace", "Tulle", "Velvet"],
  casual: ["Cotton", "Linen", "Denim", "Jersey"],
  evening: ["Velvet", "Satin", "Silk", "Sequins"],
  traditional: ["Ankara", "Kente", "Aso Oke", "Cotton", "Silk"],
  "red-carpet": ["Silk", "Velvet", "Satin", "Sequins", "Tulle"],
  "date-night": ["Silk", "Lace", "Velvet", "Satin"],
  vacation: ["Linen", "Cotton", "Rayon", "Chambray"],
}

const VIBE_COLORS: Record<string, string[]> = {
  elegant: ["Jet Black", "Navy", "Ivory", "Champagne", "Gold"],
  bold: ["Burgundy", "Emerald", "Gold", "Cognac", "Sky Blue"],
  minimal: ["Jet Black", "Pure White", "Cream", "Stone Gray", "Navy"],
  romantic: ["Champagne", "Ivory", "Sky Blue", "Cream", "Burgundy"],
  edgy: ["Jet Black", "Charcoal", "Burgundy", "Cognac", "Gold"],
  "traditional-luxe": ["Gold", "Emerald", "Burgundy", "Cognac", "Champagne"],
  preppy: ["Navy", "Cream", "Burgundy", "Camel", "Pure White"],
  bohemian: ["Cream", "Camel", "Sky Blue", "Stone Gray", "Ivory"],
}

function scoreProductForOutfit(
  product: ProductRecord,
  occasion: Occasion,
  vibe: Vibe,
  usedColors: Set<string>,
  neededRoles: string[]
): number {
  let score = 0
  const occMap = OCCASION_STYLE_MAP[occasion]

  if (occMap.tags.some((t) => product.tags?.some((pt) => pt.toLowerCase().includes(t)))) score += 20
  if (occMap.styles.some((s) => product.style?.toLowerCase().includes(s.toLowerCase()))) score += 15
  if (product.occasion?.toLowerCase() === occasion) score += 25
  if (product.season === "All Season") score += 5

  const goodColors = VIBE_COLORS[vibe] || []
  const availableColors = (product.colors || []).filter((c) => !usedColors.has(c))
  if (availableColors.length > 0) score += 10

  const bestColor = availableColors.find((c) => goodColors.includes(c)) || availableColors[0]
  if (bestColor && goodColors.includes(bestColor)) score += 15

  const role = detectRole(product.category, product.name)
  if (neededRoles.includes(role)) score += 30

  return score
}

function pickBestColor(product: ProductRecord, usedColors: Set<string>, vibe: Vibe): string {
  const goodColors = VIBE_COLORS[vibe] || []
  const available = (product.colors || []).filter((c) => !usedColors.has(c))
  return available.find((c) => goodColors.includes(c)) || available[0] || "Jet Black"
}

function distributeTextures(outfit: OutfitItem[], occasion: Occasion): string[] {
  const textures = OCCASION_TEXTURES[occasion] || ["Cotton"]
  return outfit.map((_, i) => textures[i % textures.length])
}

function composeOutfits(
  products: ProductRecord[],
  occasion: Occasion,
  vibe: Vibe,
  gender: string
): StyledOutfit[] {
  const outfits: StyledOutfit[] = []
  const productPool = [...products]
  const usedProductIds = new Set<string>()

  const outfitConfigs = [
    { roles: ["top", "bottom", "footwear"], namePrefix: "Classic" },
    { roles: ["full", "accessory", "footwear"], namePrefix: "Statement" },
    { roles: ["outerwear", "top", "bottom"], namePrefix: "Layered" },
    { roles: ["top", "bottom", "accessory"], namePrefix: "Refined" },
  ]

  for (const config of outfitConfigs) {
    const usedColors = new Set<string>()
    const items: OutfitItem[] = []

    for (const role of config.roles) {
      let best: ProductRecord | null = null
      let bestScore = -1

      for (const p of productPool) {
        if (usedProductIds.has(p.id)) continue
        if (detectRole(p.category, p.name) !== role) continue

        const neededRoles = config.roles.filter((r) => !items.find((i) => detectRole(i.category, i.name) === r))
        const s = scoreProductForOutfit(p, occasion, vibe, usedColors, neededRoles)
        if (s > bestScore) {
          bestScore = s
          best = p
        }
      }

      if (!best) continue

      const color = pickBestColor(best, usedColors, vibe)
      usedColors.add(color)
      usedProductIds.add(best.id)

      items.push({
        productId: best.id,
        slug: best.slug,
        name: best.name,
        price: best.price,
        image: best.images?.[0] || "",
        category: best.category,
        color,
        fabric: best.fabric || undefined,
      })
    }

    if (items.length >= 2) {
      const textures = distributeTextures(items, occasion)
      const notes = items.map(
        (item, i) => `${item.name} in ${item.color}${item.fabric ? ` (${item.fabric})` : ""}`
      ).join(", ")

      outfits.push({
        id: `outfit-${outfits.length + 1}`,
        name: `${config.namePrefix} ${vibe === "elegant" ? "Elegance" : vibe === "bold" ? "Edge" : vibe === "minimal" ? "Simplicity" : "Look"}`,
        description: `A ${vibe.replace("-", " ")} outfit for ${occasion} — ${notes}`.slice(0, 120),
        styleNotes: [
          `Perfect for ${occasion.replace("-", " ")} occasions`,
          `Color palette: ${[...usedColors].slice(0, 3).join(", ")}`,
          `Texture mix: ${textures.slice(0, 3).join(", ")}`,
        ].join(". "),
        items,
        totalPrice: items.reduce((sum, i) => sum + i.price, 0),
      })
    }
  }

  return outfits
}

async function aiCompose(
  products: ProductRecord[],
  request: StylistRequest,
  apiKey: string
): Promise<StyledOutfit[]> {
  const productData = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.images?.[0] || "",
    category: p.category,
    colors: p.colors,
    fabric: p.fabric,
    gender: p.gender,
    style: p.style,
    tags: p.tags,
    season: p.season,
  }))

  const sysPrompt = `You are YSI's AI Style Editor, a fashion stylist for a luxury Nigerian tailoring brand. 
Create ${products.length > 10 ? 4 : 3} complete outfit combinations from the provided product catalog.
Each outfit must use different products (no product repeats across outfits).
Consider color harmony, texture mixing, occasion appropriateness, and the requested vibe.

Return valid JSON ONLY with this exact structure:
{
  "outfits": [
    {
      "name": "string (creative outfit name)",
      "description": "string (one-line description of the look)",
      "styleNotes": "string (styling tips: why these pieces work, what shoes/accessories to add)",
      "items": [
        { "productId": "string", "color": "string (best color from product's available colors)" }
      ]
    }
  ]
}`

  const userPrompt = `Occasion: ${request.occasion}
Vibe: ${request.vibe}
Gender: ${request.gender}
${request.description ? `Additional Notes: ${request.description}` : ""}

Product Catalog:
${JSON.stringify(productData, null, 2)}`

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("OpenAI API error:", err)
    return composeOutfits(products, request.occasion, request.vibe, request.gender)
  }

  const data = await res.json()
  try {
    const parsed = JSON.parse(data.choices[0].message.content)
    const productMap = new Map(products.map((p) => [p.id, p]))

    return (parsed.outfits || []).map((o: any, i: number) => {
      const items: OutfitItem[] = (o.items || [])
        .map((item: any) => {
          const p = productMap.get(item.productId)
          if (!p) return null
          return {
            productId: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            image: p.images?.[0] || "",
            category: p.category,
            color: item.color || (p.colors?.[0] ?? "Jet Black"),
            fabric: p.fabric || undefined,
          }
        })
        .filter(Boolean) as OutfitItem[]

      return {
        id: `outfit-${i + 1}`,
        name: o.name || `Look ${i + 1}`,
        description: o.description || "",
        styleNotes: o.styleNotes || "",
        items,
        totalPrice: items.reduce((sum, item) => sum + item.price, 0),
      }
    }).filter((o: StyledOutfit) => o.items.length >= 2)
  } catch {
    return composeOutfits(products, request.occasion, request.vibe, request.gender)
  }
}

export async function generateOutfits(
  products: ProductRecord[],
  request: StylistRequest
): Promise<StyledOutfit[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey && products.length >= 4) {
    try {
      const aiResult = await aiCompose(products, request, apiKey)
      if (aiResult.length > 0) return aiResult
    } catch {
    }
  }

  return composeOutfits(products, request.occasion, request.vibe, request.gender)
}
