"use client";

import { motion } from "framer-motion";
import { slideInLeft, slideInRight } from "@/lib/motion";

export function BrandStory() {
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image side */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative aspect-[4/5] overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85"
              alt="YSI Tailoring Workshop"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-jet/10" />
            {/* Decorative gold corner */}
            <div className="absolute -top-1 -left-1 w-24 h-24 border-t-2 border-l-2 border-gold/40" />
            <div className="absolute -bottom-1 -right-1 w-24 h-24 border-b-2 border-r-2 border-gold/40" />
          </motion.div>

          {/* Text side */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-lg"
          >
            <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">
              Our Story
            </span>
            <h2 className="font-display text-4xl lg:text-6xl text-jet mt-3 leading-[1.08]">
              Craftsmanship
              <br />
              <span className="text-gradient-gold">Meets Passion</span>
            </h2>
            <div className="gold-divider mt-6 w-24" />

            <div className="space-y-5 mt-8 text-jet/70 text-sm lg:text-base leading-relaxed">
              <p>
                At YSI, every stitch tells a story. Founded on the belief that
                what you wear should be as extraordinary as who you are, we have
                dedicated ourselves to the art of exceptional tailoring.
              </p>
              <p>
                From our atelier in Lagos, we source the world&apos;s finest
                fabrics&mdash;Italian wools, French laces, Swiss cottons&mdash;and
                transform them into garments that transcend fashion to become
                heirlooms.
              </p>
              <p>
                Our master tailors bring decades of experience to every piece,
                ensuring that whether you commission a bespoke suit or select
                from our ready-to-wear collection, you experience the same
                uncompromising quality: precision cuts, flawless finishes, and
                an understanding of silhouette that makes every YSI piece fit
                like it was made for you.
              </p>
              <p>
                Because true style is personal. True style is tailored. True
                style is YSI.
              </p>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <div className="text-center">
                <span className="font-display text-3xl lg:text-4xl text-jet">
                  15+
                </span>
                <p className="text-jet/50 text-[10px] font-poppins uppercase tracking-luxe mt-1">
                  Years of Excellence
                </p>
              </div>
              <div className="w-px h-10 bg-jet/10" />
              <div className="text-center">
                <span className="font-display text-3xl lg:text-4xl text-jet">
                  10K+
                </span>
                <p className="text-jet/50 text-[10px] font-poppins uppercase tracking-luxe mt-1">
                  Satisfied Clients
                </p>
              </div>
              <div className="w-px h-10 bg-jet/10" />
              <div className="text-center">
                <span className="font-display text-3xl lg:text-4xl text-jet">
                  5K+
                </span>
                <p className="text-jet/50 text-[10px] font-poppins uppercase tracking-luxe mt-1">
                  Bespoke Creations
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
