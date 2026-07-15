"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Search, Home, User } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";

const topLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/shop", icon: Search },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

export function MobileNav() {
  const { toggleCart, totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="glass-dark border-t border-white/10">
        <div className="flex items-center justify-around h-[64px] px-2">
          {topLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-0.5 text-cream/60 hover:text-gold transition-colors duration-300"
            >
              <link.icon size={18} />
              <span className="text-[9px] font-poppins uppercase tracking-luxe">
                {link.label}
              </span>
            </Link>
          ))}
          <button
            onClick={toggleCart}
            className="flex flex-col items-center gap-0.5 text-cream/60 hover:text-gold transition-colors duration-300 relative"
          >
            <ShoppingBag size={18} />
            <span className="text-[9px] font-poppins uppercase tracking-luxe">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-gold text-jet text-[8px] font-poppins font-medium flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}