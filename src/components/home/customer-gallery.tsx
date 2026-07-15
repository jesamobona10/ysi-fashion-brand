"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";

const galleryItems = [
  { id: "g1", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80", customerName: "Michael A.", occasion: "Corporate Event", location: "Lagos" },
  { id: "g2", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80", customerName: "Sarah J.", occasion: "Wedding", location: "Abuja" },
  { id: "g3", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80", customerName: "Ngozi F.", occasion: "Birthday Shoot", location: "Port Harcourt" },
  { id: "g4", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80", customerName: "James O.", occasion: "Award Ceremony", location: "Lagos" },
  { id: "g5", image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&q=80", customerName: "Temi D.", occasion: "Casual Shoot", location: "Ibadan" },
  { id: "g6", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80", customerName: "Yvonne K.", occasion: "Evening Gala", location: "Lagos" },
  { id: "g7", image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&q=80", customerName: "Adebayo R.", occasion: "Board Meeting", location: "Abuja" },
  { id: "g8", image: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=400&q=80", customerName: "Ifeanyi C.", occasion: "Traditional Wedding", location: "Enugu" },
];

export function CustomerGallery() {
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">
            Community
          </span>
          <h2 className="font-display text-4xl lg:text-6xl text-jet mt-2">
            Styled by YSI
          </h2>
          <div className="gold-divider mt-6 w-24" />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="columns-2 lg:columns-4 gap-4 lg:gap-5 space-y-4 lg:space-y-5"
        >
          {galleryItems.map((item, i) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              className={`relative group overflow-hidden break-inside-avoid ${
                i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"
              }`}
            >
              <img
                src={item.image}
                alt={item.customerName}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-jet/0 group-hover:bg-jet/50 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                <p className="font-poppins text-xs text-cream font-medium">
                  {item.customerName}
                </p>
                <p className="text-cream/60 text-[10px] font-poppins mt-0.5">
                  {item.occasion} &middot; {item.location}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
