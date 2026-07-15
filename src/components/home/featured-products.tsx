"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { Heart, ShoppingBag, Eye, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/providers/cart-provider";

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  fabric: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

function toProduct(p: Record<string, unknown>): Product {
  return {
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
    category: p.category as string,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    images: (p.images as string[]) || [],
    fabric: p.fabric as string,
    inStock: p.in_stock as boolean,
    rating: Number(p.rating) || 0,
    reviewCount: Number(p.review_count) || 0,
    isNew: p.is_new as boolean,
    isBestseller: p.is_bestseller as boolean,
  };
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem, toggleCart } = useCart();

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0], slug: product.slug });
    toggleCart();
  };

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) => setProducts(data.map(toProduct)))
      .catch(() => {});
  }, []);

  const displayed = products.slice(0, 8);

  return (
    <section className="py-24 lg:py-32 bg-ivory">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-14 gap-6"
        >
          <div>
            <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">Featured</span>
            <h2 className="font-display text-4xl lg:text-6xl text-jet mt-2">Editor&apos;s Picks</h2>
            <div className="gold-divider mt-6 w-24" />
          </div>
          <Link href="/shop" className="font-poppins text-[11px] uppercase tracking-luxe text-jet/60 hover:text-jet transition-colors flex items-center gap-2 luxury-link">
            View All <span className="text-lg">→</span>
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {displayed.map((product) => (
            <motion.div key={product.id} variants={fadeUp} className="group relative bg-cream overflow-hidden">
              <Link href={`/shop/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={product.images[0]} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-jet/0 group-hover:bg-jet/30 transition-all duration-500" />
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    <div className="flex gap-2">
                      <button onClick={(e) => handleAdd(product, e)} className="flex-1 h-10 bg-cream text-jet text-[10px] font-poppins uppercase tracking-luxe flex items-center justify-center gap-1.5 hover:bg-gold transition-colors duration-300"><ShoppingBag size={13} /> Add to Cart</button>
                      <button className="w-10 h-10 bg-cream text-jet flex items-center justify-center hover:bg-gold transition-colors duration-300"><Heart size={14} /></button>
                      <button className="w-10 h-10 bg-cream text-jet flex items-center justify-center hover:bg-gold transition-colors duration-300"><Eye size={14} /></button>
                      <button className="w-10 h-10 bg-cream text-jet flex items-center justify-center hover:bg-gold transition-colors duration-300"><GitCompare size={14} /></button>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && <Badge variant="gold">New</Badge>}
                    {product.isBestseller && <Badge variant="default">Bestseller</Badge>}
                    {product.originalPrice && <Badge variant="burgundy">Sale</Badge>}
                  </div>
                </div>
                <div className="p-4 lg:p-5">
                  <p className="text-jet/50 text-[10px] font-poppins uppercase tracking-luxe mb-1">{product.category}</p>
                  <h3 className="font-poppins text-sm lg:text-base text-jet font-medium leading-tight">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-poppins text-sm font-medium text-jet">{formatPrice(product.price)}</span>
                    {product.originalPrice && <span className="font-poppins text-xs text-jet/40 line-through">{formatPrice(product.originalPrice)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-jet/40 text-[10px]">
                    <span>{product.fabric}</span>
                    <span className="w-1 h-1 rounded-full bg-jet/20" />
                    <span className={product.inStock ? "text-emerald" : "text-burgundy"}>{product.inStock ? "In Stock" : "Made to Order"}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-gold" : "text-jet/10"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-jet/40 text-[10px]">({product.reviewCount})</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}