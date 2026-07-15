"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";

const timelineSteps = [
  { step: 1, title: "Consultation", description: "Meet with our styling experts to discuss your vision, occasion, and preferences.", icon: "MessageCircle" },
  { step: 2, title: "Measurements", description: "Precision measurements are taken by our master tailors for the perfect fit.", icon: "Ruler" },
  { step: 3, title: "Fabric Selection", description: "Choose from our curated library of premium fabrics from across the world.", icon: "Layers" },
  { step: 4, title: "Design Sketch", description: "Our designers create a detailed sketch of your garment for your approval.", icon: "PenTool" },
  { step: 5, title: "Tailoring", description: "Expert craftsmen bring your design to life with precision and care.", icon: "Scissors" },
  { step: 6, title: "Quality Check", description: "Every stitch is inspected to ensure it meets YSI's uncompromising standards.", icon: "SearchCheck" },
  { step: 7, title: "Delivery", description: "Your masterpiece is delivered in premium packaging, ready to be worn.", icon: "Package" },
];
import {
  MessageCircle,
  Ruler,
  Layers,
  PenTool,
  Scissors,
  SearchCheck,
  Package,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  MessageCircle: <MessageCircle size={22} />,
  Ruler: <Ruler size={22} />,
  Layers: <Layers size={22} />,
  PenTool: <PenTool size={22} />,
  Scissors: <Scissors size={22} />,
  SearchCheck: <SearchCheck size={22} />,
  Package: <Package size={22} />,
};

export function BespokeTimeline() {
  return (
    <section className="py-24 lg:py-32 bg-jet text-cream">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">
            The Experience
          </span>
          <h2 className="font-display text-4xl lg:text-6xl text-cream mt-3">
            Bespoke Tailoring
            <br />
            <span className="text-gradient-gold">Journey</span>
          </h2>
          <p className="text-cream/50 text-sm max-w-lg mx-auto mt-4">
            From your first consultation to the final reveal, experience the art
            of custom craftsmanship.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative"
        >
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

          <div className="grid lg:grid-cols-2 gap-x-20 gap-y-12">
            {timelineSteps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className={`relative flex gap-5 lg:gap-6 ${
                  i % 2 === 0 ? "lg:text-right lg:flex-row-reverse" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`shrink-0 w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center bg-jet-soft ${
                    i % 2 === 0 ? "lg:order-2" : ""
                  }`}
                >
                  <span className="text-gold">{iconMap[step.icon]}</span>
                </div>

                {/* Text */}
                <div className={i % 2 === 0 ? "lg:order-1" : ""}>
                  <span className="font-display text-2xl text-gold/40 font-bold">
                    {String(step.step).padStart(2, "0")}
                  </span>
                  <h3 className="font-poppins text-base text-cream mt-1 font-medium">
                    {step.title}
                  </h3>
                  <p className="text-cream/50 text-sm mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mt-16"
        >
          <Button asChild variant="gold" size="lg">
            <Link href="/bespoke">Book Your Tailoring Session</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
