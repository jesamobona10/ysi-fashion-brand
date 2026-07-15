"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { ArrowUpRight } from "lucide-react";

const journalArticles = [
  { id: "j1", title: "The Art of Power Dressing: A Guide for the Modern Professional", excerpt: "Discover how the right tailoring can transform your presence in the boardroom and beyond.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", category: "Style Guide", date: "Jun 28, 2026", author: "YSI Style Desk", slug: "art-of-power-dressing" },
  { id: "j2", title: "Bridal Fashion: Trends Redefining African Weddings in 2026", excerpt: "From Aso Oke reimaginings to modern silhouettes, explore the trends shaping the future of bridal fashion.", image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=600&q=80", category: "Wedding Fashion", date: "Jun 20, 2026", author: "Chioma E.", slug: "bridal-trends-2026" },
  { id: "j3", title: "Corporate Elegance: How to Command Respect Through Your Wardrobe", excerpt: "Your clothes speak before you do. Learn how YSI's corporate collection helps you make the right impression.", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", category: "Corporate Dressing", date: "Jun 12, 2026", author: "YSI Style Desk", slug: "corporate-elegance" },
  { id: "j4", title: "Seasonal Transitions: Curating Your Capsule Wardrobe", excerpt: "Master the art of transitioning your wardrobe between seasons without sacrificing style or comfort.", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80", category: "Seasonal Trends", date: "Jun 5, 2026", author: "Amara O.", slug: "capsule-wardrobe-guide" },
  { id: "j5", title: "The Complete Guide to Caring for Premium Fabrics", excerpt: "Protect your investment. Everything you need to know about maintaining wool, silk, cashmere, and more.", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", category: "Fabric Care", date: "May 28, 2026", author: "YSI Style Desk", slug: "premium-fabric-care" },
  { id: "j6", title: "Celebrity Style Breakdown: Iconic Looks You Can Recreate", excerpt: "Get the red-carpet look with YSI's tailoring expertise. We break down celebrity outfits you can commission.", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80", category: "Celebrity Style", date: "May 20, 2026", author: "Tunde A.", slug: "celebrity-look-breakdown" },
  { id: "j7", title: "Bespoke vs. Ready-to-Wear: Which Is Right for You?", excerpt: "Understanding the difference between made-to-measure and ready-to-wear, and how to choose based on your needs.", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80", category: "Style Guide", date: "May 14, 2026", author: "YSI Style Desk", slug: "bespoke-vs-ready-to-wear" },
];

export function FashionJournal() {
  return (
    <section className="py-24 lg:py-32 bg-ivory">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-14 gap-6"
        >
          <div>
            <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">
              Journal
            </span>
            <h2 className="font-display text-4xl lg:text-6xl text-jet mt-2">
              The YSI Edit
            </h2>
            <div className="gold-divider mt-6 w-24" />
          </div>
          <Link
            href="/journal"
            className="font-poppins text-[11px] uppercase tracking-luxe text-jet/60 hover:text-jet transition-colors flex items-center gap-2 luxury-link"
          >
            Read All Articles <span className="text-lg">→</span>
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {journalArticles.slice(0, 6).map((article) => (
            <motion.article
              key={article.id}
              variants={fadeUp}
              className="group cursor-pointer"
            >
              <Link href={`/journal/${article.slug}`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-jet/0 group-hover:bg-jet/20 transition-all duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-cream text-jet text-[9px] font-poppins uppercase tracking-luxe px-3 py-1.5">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="w-10 h-10 bg-cream flex items-center justify-center">
                      <ArrowUpRight size={16} className="text-jet" />
                    </span>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex items-center gap-3 text-jet/40 text-[10px] font-poppins uppercase tracking-luxe">
                    <span>{article.date}</span>
                    <span className="w-1 h-1 rounded-full bg-jet/20" />
                    <span>{article.author}</span>
                  </div>
                  <h3 className="font-poppins text-base lg:text-lg text-jet mt-2 leading-snug group-hover:text-gold transition-colors duration-300">
                    {article.title}
                  </h3>
                  <p className="text-jet/60 text-sm mt-2 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
