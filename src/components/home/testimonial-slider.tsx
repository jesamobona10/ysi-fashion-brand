"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  { id: "t1", name: "Amara O.", location: "Lagos, Nigeria", avatar: "https://i.pravatar.cc/100?img=1", rating: 5, text: "YSI transformed my wedding vision into reality. The bespoke gown was beyond anything I could have imagined. Every stitch told a story of craftsmanship and love.", occasion: "Wedding" },
  { id: "t2", name: "David K.", location: "Abuja, Nigeria", avatar: "https://i.pravatar.cc/100?img=3", rating: 5, text: "The attention to detail in my corporate suits is unmatched. I've never felt more confident in a boardroom. YSI is now my tailor for life.", occasion: "Corporate" },
  { id: "t3", name: "Chioma E.", location: "Port Harcourt, Nigeria", avatar: "https://i.pravatar.cc/100?img=5", rating: 5, text: "From the fabric selection to the final fitting, the entire bespoke experience was exceptional. I felt like a muse in a fashion atelier.", occasion: "Bespoke" },
  { id: "t4", name: "Tunde A.", location: "Lagos, Nigeria", avatar: "https://i.pravatar.cc/100?img=8", rating: 4, text: "The ready-to-wear collection is perfect for the modern professional. Quality that rivals international luxury brands, right here in Lagos.", occasion: "Ready-to-Wear" },
  { id: "t5", name: "Zara M.", location: "Accra, Ghana", avatar: "https://i.pravatar.cc/100?img=9", rating: 5, text: "I traveled from Ghana specifically for YSI's bespoke experience. Worth every mile. The fit is impeccable and the styling advice was invaluable.", occasion: "Bespoke" },
];

export function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const testimonial = testimonials[current];

  const next = () =>
    setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  return (
    <section className="py-24 lg:py-32 bg-jet text-cream">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">
            Testimonials
          </span>
          <h2 className="font-display text-4xl lg:text-6xl text-cream mt-2">
            What Our Clients Say
          </h2>
          <div className="gold-divider mt-6 mx-auto w-24" />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-none p-10 lg:p-14"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < testimonial.rating
                        ? "text-gold fill-gold"
                        : "text-white/20"
                    }
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-serif-lux text-xl lg:text-2xl text-cream/90 leading-relaxed italic">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 mt-8">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-poppins text-sm text-cream font-medium">
                    {testimonial.name}
                  </p>
                  <p className="text-cream/50 text-xs">
                    {testimonial.location}
                  </p>
                </div>
                {testimonial.occasion && (
                  <span className="ml-auto text-gold text-[10px] font-poppins uppercase tracking-luxe border border-gold/30 px-3 py-1">
                    {testimonial.occasion}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-cream/60 hover:text-gold hover:border-gold/50 transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    i === current ? "bg-gold w-6" : "bg-white/20"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-cream/60 hover:text-gold hover:border-gold/50 transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
