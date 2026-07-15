"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";

const navLinks = [
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  { label: "Bespoke", href: "/bespoke" },
  { label: "Collections", href: "/shop" },
  { label: "Journal", href: "/journal" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const { totalItems, toggleCart } = useCart();
  const { isAuthenticated } = useAuth();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "glass-light shadow-soft"
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[72px] lg:h-20">
            <button
              className="lg:hidden text-jet"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-poppins text-[11px] uppercase tracking-luxe text-jet/80 hover:text-jet transition-colors duration-300 luxury-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <span className="font-display text-2xl lg:text-3xl font-black tracking-[0.15em] text-jet">
                YSI
              </span>
            </Link>

            <div className="flex items-center gap-4 lg:gap-6">
              <button
                className="hidden lg:flex text-jet/70 hover:text-jet transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <button
                className="hidden lg:flex text-jet/70 hover:text-jet transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={18} />
              </button>
              <Link
                href={isAuthenticated ? "/account" : "/auth/login"}
                className="text-jet/70 hover:text-jet transition-colors"
                aria-label="Account"
              >
                <User size={18} />
              </Link>
              <button
                onClick={toggleCart}
                className="relative text-jet/70 hover:text-jet transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-jet text-cream text-[9px] font-poppins font-medium flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Bottom gold divider */}
          <div className="gold-divider opacity-50" />
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-cream lg:hidden"
        >
          <div className="flex flex-col h-full p-8">
            <div className="flex justify-between items-center mb-12">
              <span className="font-display text-2xl font-black tracking-[0.15em]">
                YSI
              </span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <span className="text-2xl font-serif-lux">&times;</span>
              </button>
            </div>
            <nav className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-4xl text-jet/90 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex gap-6 text-jet/60">
              <button onClick={() => setMobileOpen(false)}><Search size={20} /></button>
              <button onClick={() => setMobileOpen(false)}><Heart size={20} /></button>
              <Link href={isAuthenticated ? "/account" : "/auth/login"} onClick={() => setMobileOpen(false)}><User size={20} /></Link>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
