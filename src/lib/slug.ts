export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function generateSKU(name: string, index: number): string {
  const prefix = name.slice(0, 3).toUpperCase()
  return `YSI-${prefix}-${String(index).padStart(3, "0")}`
}