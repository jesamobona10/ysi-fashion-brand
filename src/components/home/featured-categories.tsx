"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { staggerContainer, fadeUp } from "@/lib/motion";

const categories = [
  { id: "c1", name: "Men's Collection", slug: "men", description: "Sharp. Confident. Uncompromising.", gender: "men", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80" },
  { id: "c2", name: "Women's Collection", slug: "women", description: "Elegance redefined. Power reimagined.", gender: "women", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80" },
  { id: "c3", name: "Bespoke Tailoring", slug: "bespoke", description: "Designed for you. Only for you.", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" },
  { id: "c4", name: "Ready-to-Wear", slug: "ready-to-wear", description: "Off the rack. On the pulse.", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" },
  { id: "c5", name: "Wedding Collection", slug: "wedding", description: "Forever starts in style.", image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=600&q=80" },
  { id: "c6", name: "Corporate Collection", slug: "corporate", description: "Executive presence, perfected.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
  { id: "c7", name: "Traditional Wear", slug: "traditional", description: "Heritage. Honor. Style.", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80" },
  { id: "c8", name: "Casual Essentials", slug: "casual", description: "Effortless everyday luxury.", image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=600&q=80" },
  { id: "c9", name: "Luxury Evening Wear", slug: "evening", description: "For the unforgettable nights.", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80" },
  { id: "c10", name: "Accessories", slug: "accessories", description: "The finishing touch.", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80" },
];

export function FeaturedCategories() {
  return (
    <section className="py-24 lg:py-32 bg-ivory">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">Collections</span>
          <h2 className="font-display text-4xl lg:text-6xl text-jet mt-2">Browse by Category</h2>
          <div className="gold-divider mt-6 w-24" />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={fadeUp} className="group relative aspect-[3/4] overflow-hidden cursor-pointer">
              <Link href={cat.gender ? `/shop?gender=${cat.gender}` : `/shop?category=${cat.slug}`} className="block h-full">
                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-jet/80 via-jet/10 to-transparent transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                  <p className="text-cream/60 text-[10px] font-poppins uppercase tracking-luxe mb-1">{cat.description}</p>
                  <h3 className="font-display text-lg lg:text-xl text-cream group-hover:text-gold transition-colors duration-300">{cat.name}</h3>
                </div>
                <div className="absolute top-0 left-0 w-0 h-[2px] bg-gold transition-all duration-500 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
