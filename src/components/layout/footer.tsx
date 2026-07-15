"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";

const footerLinks = {
  collections: [
    { label: "Men's Collection", href: "/shop?gender=men" },
    { label: "Women's Collection", href: "/shop?gender=women" },
    { label: "Bespoke Tailoring", href: "/bespoke" },
    { label: "Ready-to-Wear", href: "/shop?collection=ready-to-wear" },
    { label: "Wedding Collection", href: "/shop?collection=wedding" },
    { label: "Corporate Collection", href: "/shop?collection=corporate" },
  ],
  services: [
    { label: "Custom Tailoring", href: "/bespoke" },
    { label: "Styling Consultation", href: "/bespoke" },
    { label: "Alterations", href: "/services" },
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "Corporate Orders", href: "/corporate" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Press", href: "/press" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Youtube, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-jet text-cream/70 pb-24 lg:pb-0">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="font-serif-lux text-gold text-lg tracking-luxe-sm mb-2">
              YSI Newsletter
            </p>
            <h2 className="font-display text-3xl lg:text-5xl text-cream mb-4">
              Stay Styled.
              <br />
              <span className="text-gold">Stay Inspired.</span>
            </h2>
            <p className="text-cream/50 text-sm mb-8 max-w-md mx-auto">
              Join the YSI community. Receive exclusive styling tips, early
              access to new collections, and bespoke offers.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-3 max-w-lg mx-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 h-14 bg-white/5 border border-white/10 rounded-none px-6 text-cream placeholder:text-cream/30 text-sm font-poppins focus:outline-none focus:border-gold/60 transition-colors"
              />
              <button
                type="submit"
                className="h-14 px-8 bg-gold text-jet font-poppins text-xs uppercase tracking-luxe hover:bg-gold-light transition-colors duration-500"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/">
              <span className="font-display text-3xl font-black tracking-[0.15em] text-cream">
                YSI
              </span>
            </Link>
            <p className="text-cream/40 text-xs tracking-luxe-sm uppercase mt-2 mb-6">
              YUTY_STYLEDIT
            </p>
            <p className="text-sm text-cream/60 leading-relaxed mb-6">
              Premium tailoring, bespoke craftsmanship, and ready-to-wear
              collections designed to elevate every occasion.
            </p>
            <p className="text-cream/40 text-sm font-serif-lux italic">
              &ldquo;Styling You With Finesse.&rdquo;
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                  href={s.href}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-poppins text-[11px] uppercase tracking-luxe text-cream/50 mb-5">
                {title}
              </h3>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10 py-6 flex flex-col lg:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream/40">
            &copy; {new Date().getFullYear()} YSI (YUTY_STYLEDIT). All rights
            reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-cream/40">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> Lagos, Nigeria
            </span>
            <span className="flex items-center gap-1">
              <Phone size={12} /> +234 800 YSI
            </span>
            <span className="flex items-center gap-1">
              <Mail size={12} /> hello@ysi.ng
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
