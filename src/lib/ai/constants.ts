export const OCCASIONS = [
  { value: "corporate", label: "Corporate & Business", icon: "💼", desc: "Board meetings, client pitches, office wear" },
  { value: "wedding", label: "Wedding", icon: "💍", desc: "Guest attire, bridal party, ceremony looks" },
  { value: "casual", label: "Casual & Everyday", icon: "☀️", desc: "Weekend brunch, errands, relaxed outings" },
  { value: "evening", label: "Evening & Night Out", icon: "🌙", desc: "Dinner dates, club nights, cocktail parties" },
  { value: "traditional", label: "Traditional Ceremony", icon: "🎭", desc: "Owambe, traditional weddings, cultural events" },
  { value: "red-carpet", label: "Red Carpet & Gala", icon: "⭐", desc: "Formal galas, award ceremonies, black tie" },
  { value: "date-night", label: "Date Night", icon: "❤️", desc: "Romantic dinners, special occasions for two" },
  { value: "vacation", label: "Vacation & Getaway", icon: "✈️", desc: "Holiday looks, resort wear, travel outfits" },
] as const

export const VIBES = [
  { value: "elegant", label: "Elegant & Sophisticated", desc: "Timeless, refined, classy silhouettes" },
  { value: "bold", label: "Bold & Daring", desc: "Statement pieces, vibrant colors, avant-garde" },
  { value: "minimal", label: "Minimal & Clean", desc: "Clean lines, neutral tones, understated luxury" },
  { value: "romantic", label: "Romantic & Soft", desc: "Soft fabrics, pastels, flowing silhouettes" },
  { value: "edgy", label: "Edgy & Modern", desc: "Contemporary cuts, dark tones, fashion-forward" },
  { value: "traditional-luxe", label: "Traditional Luxury", desc: "Ankara, agbada, native-inspired elegance" },
  { value: "preppy", label: "Preppy & Polished", desc: "Tailored classics, structured blazers, crisp lines" },
  { value: "bohemian", label: "Bohemian & Free", desc: "Relaxed silhouettes, earthy tones, artistic flair" },
] as const

export type Occasion = (typeof OCCASIONS)[number]["value"]
export type Vibe = (typeof VIBES)[number]["value"]

export const OCCASION_STYLE_MAP: Record<Occasion, { tags: string[]; styles: string[] }> = {
  corporate: { tags: ["corporate", "business", "office"], styles: ["Tailored", "Classic", "Modern"] },
  wedding: { tags: ["wedding", "ceremony", "formal"], styles: ["Formal", "Traditional", "Luxury"] },
  casual: { tags: ["casual", "everyday", "relaxed"], styles: ["Casual", "Relaxed", "Contemporary"] },
  evening: { tags: ["evening", "night", "party"], styles: ["Evening", "Bold", "Modern"] },
  traditional: { tags: ["traditional", "native", "cultural"], styles: ["Traditional", "Cultural", "Classic"] },
  "red-carpet": { tags: ["formal", "gala", "red-carpet"], styles: ["Luxury", "Evening", "Formal"] },
  "date-night": { tags: ["date", "romantic", "evening"], styles: ["Romantic", "Elegant", "Modern"] },
  vacation: { tags: ["vacation", "resort", "travel"], styles: ["Casual", "Relaxed", "Bohemian"] },
}
