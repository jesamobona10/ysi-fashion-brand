"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { staggerContainer, fadeUp } from "@/lib/motion"
import {
  MessageCircle, Ruler, Layers, PenTool, Scissors, SearchCheck, Package,
  ArrowUpRight, Sparkles, Shield, Clock,
} from "lucide-react"

const timelineSteps = [
  { step: 1, title: "Consultation", description: "Meet with our styling experts to discuss your vision, occasion, and preferences.", icon: <MessageCircle size={22} /> },
  { step: 2, title: "Measurements", description: "Precision measurements are taken by our master tailors for the perfect fit.", icon: <Ruler size={22} /> },
  { step: 3, title: "Fabric Selection", description: "Choose from our curated library of premium fabrics from across the world.", icon: <Layers size={22} /> },
  { step: 4, title: "Design Sketch", description: "Our designers create a detailed sketch of your garment for your approval.", icon: <PenTool size={22} /> },
  { step: 5, title: "Tailoring", description: "Expert craftsmen bring your design to life with precision and care.", icon: <Scissors size={22} /> },
  { step: 6, title: "Quality Check", description: "Every stitch is inspected to ensure it meets YSI's uncompromising standards.", icon: <SearchCheck size={22} /> },
  { step: 7, title: "Delivery", description: "Your masterpiece is delivered in premium packaging, ready to be worn.", icon: <Package size={22} /> },
]

const benefits = [
  { icon: <Sparkles size={20} />, title: "Perfect Fit Guaranteed", description: "Multiple fittings ensure your garment fits like a second skin." },
  { icon: <Shield size={20} />, title: "Premium Materials", description: "Access to an exclusive library of the world's finest fabrics." },
  { icon: <Clock size={20} />, title: "Timeless Design", description: "Classic silhouettes with modern details that transcend seasons." },
]

export default function BespokePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center bg-jet overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1920&q=80')] bg-cover bg-center" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 w-full"
        >
          <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">Bespoke Tailoring</span>
          <h1 className="font-display text-5xl lg:text-8xl text-cream mt-4 max-w-3xl leading-[1.1]">
            Crafted
            <br />
            <span className="text-gradient-gold">For You</span>
          </h1>
          <p className="text-cream/60 text-base lg:text-lg max-w-xl mt-6 leading-relaxed">
            Experience the art of bespoke craftsmanship. From the first consultation to the final reveal,
            every detail is tailored exclusively to you.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Button asChild variant="gold" size="lg">
              <Link href="#process">Explore the Process <ArrowUpRight size={18} /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-cream/20 text-cream hover:bg-cream/10">
              <Link href="/shop">View Collection</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Why Bespoke */}
      <section className="py-24 lg:py-32 bg-ivory">
        <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">Why Bespoke</span>
            <h2 className="font-display text-4xl lg:text-5xl text-jet mt-3">Tailored to Perfection</h2>
            <div className="gold-divider mt-6 w-24 mx-auto" />
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={fadeUp}
                className="text-center p-8 bg-white/50 backdrop-blur-sm"
              >
                <span className="inline-flex w-14 h-14 items-center justify-center bg-gold/10 text-gold rounded-full mb-5">
                  {benefit.icon}
                </span>
                <h3 className="font-poppins text-base text-jet font-medium">{benefit.title}</h3>
                <p className="text-jet/60 text-sm mt-2 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Timeline */}
      <section id="process" className="py-24 lg:py-32 bg-jet text-cream">
        <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">The Experience</span>
            <h2 className="font-display text-4xl lg:text-6xl text-cream mt-3">
              Bespoke Tailoring <span className="text-gradient-gold">Journey</span>
            </h2>
            <p className="text-cream/50 text-sm max-w-lg mx-auto mt-4">
              From your first consultation to the final reveal, experience the art of custom craftsmanship.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="relative"
          >
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
            <div className="grid lg:grid-cols-2 gap-x-20 gap-y-12">
              {timelineSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  variants={fadeUp}
                  className={`relative flex gap-5 lg:gap-6 ${i % 2 === 0 ? "lg:text-right lg:flex-row-reverse" : ""}`}
                >
                  <div className={`shrink-0 w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center bg-jet-soft ${i % 2 === 0 ? "lg:order-2" : ""}`}>
                    <span className="text-gold">{step.icon}</span>
                  </div>
                  <div className={i % 2 === 0 ? "lg:order-1" : ""}>
                    <span className="font-display text-2xl text-gold/40 font-bold">{String(step.step).padStart(2, "0")}</span>
                    <h3 className="font-poppins text-base text-cream mt-1 font-medium">{step.title}</h3>
                    <p className="text-cream/50 text-sm mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-ivory">
        <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">Begin Your Journey</span>
            <h2 className="font-display text-4xl lg:text-6xl text-jet mt-4">Ready for the Perfect Fit?</h2>
            <p className="text-jet/60 text-sm max-w-lg mx-auto mt-4 leading-relaxed">
              Book a consultation with our master tailors and take the first step toward owning
              a garment that is truly yours.
            </p>
            <div className="mt-10">
              <Button asChild variant="gold" size="lg">
                <Link href="/bespoke">Book Your Consultation <ArrowUpRight size={18} /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
