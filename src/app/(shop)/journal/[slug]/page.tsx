"use client"

import { useParams, notFound } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

const journalArticles = [
  { id: "j1", title: "The Art of Power Dressing: A Guide for the Modern Professional", excerpt: "Discover how the right tailoring can transform your presence in the boardroom and beyond.", content: "In the world of business, your personal style is a powerful tool. The way you present yourself speaks volumes before you even utter a word. At YSI, we believe that power dressing is not about following trends — it's about understanding the language of tailoring and using it to command respect.\n\nThe foundation of power dressing lies in fit. A well-tailored garment transforms the silhouette, creating clean lines that convey confidence and attention to detail. From the cut of a blazer to the break of a trouser, every element contributes to the overall impression you make.\n\nColor psychology plays a crucial role. Deep navies and charcoal greys project authority, while subtle patterns add personality without sacrificing professionalism. The key is balance — letting the craftsmanship speak for itself.\n\nAccessories should be considered, not an afterthought. A quality watch, a structured bag, and polished shoes complete the ensemble. Remember: true power dressing is about feeling as good as you look.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80", category: "Style Guide", date: "Jun 28, 2026", author: "YSI Style Desk", slug: "art-of-power-dressing" },
  { id: "j2", title: "Bridal Fashion: Trends Redefining African Weddings in 2026", excerpt: "From Aso Oke reimaginings to modern silhouettes, explore the trends shaping the future of bridal fashion.", content: "African weddings have always been a celebration of color, texture, and tradition. In 2026, we are seeing a beautiful evolution where heritage meets contemporary design in ways that feel both fresh and deeply rooted.\n\nModern brides are embracing bolder silhouettes — architectural shoulders, asymmetric hemlines, and dramatic trains that make a statement. Traditional fabrics like Aso Oke and Ankara are being reimagined with modern cuts, creating pieces that honor the past while looking firmly toward the future.\n\nColor is another area of transformation. While white remains classic, we are seeing more brides choose champagne, blush, and even deep jewel tones for their ceremonies. These hues photograph beautifully and offer a unique personal touch.\n\nAt YSI, our bridal consultations focus on creating a gown that reflects your personality while ensuring you feel comfortable and confident on your special day.", image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=1200&q=80", category: "Wedding Fashion", date: "Jun 20, 2026", author: "Chioma E.", slug: "bridal-trends-2026" },
  { id: "j3", title: "Corporate Elegance: How to Command Respect Through Your Wardrobe", excerpt: "Your clothes speak before you do. Learn how YSI's corporate collection helps you make the right impression.", content: "In the corporate world, your wardrobe is your armor. It protects your confidence, projects your ambition, and communicates your attention to detail without a single word.\n\nThe modern professional needs a wardrobe that works as hard as they do. Versatility is key — pieces that transition seamlessly from morning meetings to evening networking events. Investment in quality fabrics pays dividends in both longevity and perception.\n\nFit remains paramount. Off-the-rack suits rarely accommodate the nuances of different body types. This is where made-to-measure becomes not a luxury, but a strategic advantage. A jacket that sits perfectly at the shoulders, trousers that break just right — these details separate the memorable from the forgettable.\n\nYSI's corporate collection is designed for the discerning professional who understands that their appearance is an extension of their personal brand.", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80", category: "Corporate Dressing", date: "Jun 12, 2026", author: "YSI Style Desk", slug: "corporate-elegance" },
  { id: "j4", title: "Seasonal Transitions: Curating Your Capsule Wardrobe", excerpt: "Master the art of transitioning your wardrobe between seasons without sacrificing style or comfort.", content: "The art of seasonal dressing lies not in owning more, but in owning better. A thoughtfully curated capsule wardrobe allows you to transition seamlessly between seasons while maintaining your personal style.\n\nStart with foundational pieces that work year-round — a well-tailored blazer, quality trousers, and versatile dresses in neutral tones. These become the backbone of your wardrobe, adaptable to any season with the right layering.\n\nFor warmer months, focus on breathable fabrics like linen, cotton, and lightweight wool. Lighter colors reflect heat and keep you comfortable without sacrificing style. As temperatures drop, introduce rich textures — cashmere, tweed, and heavier wools add warmth and visual interest.\n\nThe key is investing in pieces that bring you joy and fit perfectly. Every item in your capsule should earn its place by being versatile, flattering, and well-made.", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80", category: "Seasonal Trends", date: "Jun 5, 2026", author: "Amara O.", slug: "capsule-wardrobe-guide" },
  { id: "j5", title: "The Complete Guide to Caring for Premium Fabrics", excerpt: "Protect your investment. Everything you need to know about maintaining wool, silk, cashmere, and more.", content: "Investing in premium fabrics is only half the journey — proper care ensures your garments remain beautiful for years to come. Different materials require different attention, and understanding these nuances protects your investment.\n\nWool: Always dry clean for structured pieces. Between wears, use a quality garment brush to remove surface dust and hang in a well-ventilated area. Never store wool in plastic — breathable garment bags are essential.\n\nSilk: Most silk items benefit from hand washing in cold water with a gentle detergent. Avoid wringing — instead, roll in a towel to remove excess water and hang to dry away from direct sunlight.\n\nCashmere: With proper care, cashmere can last a lifetime. Fold rather than hang to maintain shape. Use a cashmere comb to remove pilling. Wash sparingly and always on a gentle cycle.\n\nAt YSI, we provide detailed care instructions with every garment to help you maintain your investment.", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80", category: "Fabric Care", date: "May 28, 2026", author: "YSI Style Desk", slug: "premium-fabric-care" },
  { id: "j6", title: "Celebrity Style Breakdown: Iconic Looks You Can Recreate", excerpt: "Get the red-carpet look with YSI's tailoring expertise. We break down celebrity outfits you can commission.", content: "Red carpet fashion inspires us all, but translating those looks into wearable, everyday elegance requires expertise. At YSI, we specialize in recreating iconic celebrity styles with a personalized touch.\n\nThe key elements that define celebrity style: impeccable fit, bold silhouettes, and attention to detail. Whether it's a structured power suit or an flowing evening gown, the foundation is always exceptional tailoring.\n\nWhen commissioning a celebrity-inspired piece, consider your body type and lifestyle. A look that works for a single red carpet appearance might need adjustments for repeated wear. Our designers work with you to capture the essence of the inspiration while creating a garment that truly belongs to you.\n\nFrom the cut to the fabric choice, every decision is made with your unique needs in mind. The result is a piece that channels the glamour of celebrity style while being authentically yours.", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80", category: "Celebrity Style", date: "May 20, 2026", author: "Tunde A.", slug: "celebrity-look-breakdown" },
  { id: "j7", title: "Bespoke vs. Ready-to-Wear: Which Is Right for You?", excerpt: "Understanding the difference between made-to-measure and ready-to-wear, and how to choose based on your needs.", content: "Choosing between bespoke and ready-to-wear is one of the most common questions we hear. Each approach has its merits, and the right choice depends on your needs, lifestyle, and priorities.\n\nReady-to-wear offers convenience and immediate availability. Our curated collections are designed with modern silhouettes and quality materials, perfect for those who need stylish pieces without the wait. Each piece is crafted with care, offering excellent value and consistent quality.\n\nBespoke tailoring, on the other hand, is a journey. From fabric selection to multiple fittings, every detail is customized to your measurements and preferences. The result is a garment that fits perfectly and reflects your personal style in ways ready-to-wear cannot match.\n\nMany of our clients choose a combination — ready-to-wear for everyday essentials and bespoke for special occasions or core wardrobe pieces. We're here to help you find the right balance.", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80", category: "Style Guide", date: "May 14, 2026", author: "YSI Style Desk", slug: "bespoke-vs-ready-to-wear" },
]

export default function JournalArticlePage() {
  const params = useParams()
  const article = journalArticles.find((a) => a.slug === params.slug)

  if (!article) notFound()

  return (
    <article>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-jet overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.image})` }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 w-full"
        >
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-cream/60 hover:text-cream text-xs font-poppins uppercase tracking-luxe transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Journal
          </Link>
          <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase block">
            {article.category}
          </span>
          <h1 className="font-display text-4xl lg:text-7xl text-cream mt-4 max-w-3xl leading-[1.1]">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-cream/40 text-[10px] font-poppins uppercase tracking-luxe mt-6">
            <span>{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-cream/20" />
            <span>{article.author}</span>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-ivory">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <p className="font-poppins text-base lg:text-lg text-jet/80 leading-relaxed mb-6 font-medium italic">
              {article.excerpt}
            </p>
            {article.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="font-poppins text-sm lg:text-base text-jet/70 leading-relaxed mb-5">
                {paragraph}
              </p>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 pt-12 border-t border-jet/10"
          >
            <div className="flex items-center justify-between">
              <div className="text-jet/40 text-[10px] font-poppins uppercase tracking-luxe">
                Published {article.date} by <span className="text-jet/60">{article.author}</span>
              </div>
              <Button asChild variant="gold" size="sm">
                <Link href="/bespoke">Book a Consultation <ArrowUpRight size={14} /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </article>
  )
}
