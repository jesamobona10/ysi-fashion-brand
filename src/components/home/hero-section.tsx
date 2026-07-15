"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} className="relative h-dvh min-h-[600px] overflow-hidden">
      {/* Background image */}
      <motion.div className="absolute inset-0" style={{ scale }}>
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=85)",
            y: parallaxY,
          }}
        />
      </motion.div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-jet/40 via-jet/25 to-jet/70" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative h-full flex flex-col items-center justify-center text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <span className="font-serif-lux text-gold tracking-luxe-sm text-sm lg:text-base">
            YSI &mdash; YUTY_STYLEDIT
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.5,
          }}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-black text-cream leading-[0.92] mt-4 tracking-tight"
        >
          Style Crafted
          <br />
          <span className="text-gradient-gold">With Finesse</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.8,
          }}
          className="text-cream/70 text-sm sm:text-base lg:text-lg max-w-xl mt-6 font-poppins leading-relaxed"
        >
          Premium tailoring, bespoke craftsmanship, and ready-to-wear
          collections designed to elevate every occasion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
            delay: 1.1,
          }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <Button asChild variant="gold" size="lg">
            <Link href="/shop">Shop Collection</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-cream/30 text-cream hover:bg-cream hover:text-jet">
            <Link href="/bespoke">Design My Outfit</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-cream/40 text-[10px] font-poppins uppercase tracking-luxe">
          Scroll
        </span>
        <ChevronDown size={16} className="text-cream/40 animate-scroll-hint" />
      </motion.div>
    </section>
  );
}
