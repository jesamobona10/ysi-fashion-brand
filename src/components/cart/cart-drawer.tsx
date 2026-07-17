"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { state, closeCart, removeItem, updateQty, totalItems, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-jet/40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-cream shadow-luxury flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-jet/5">
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} className="text-jet/40" />
                <span className="font-poppins text-sm text-jet">{totalItems} {totalItems === 1 ? "Item" : "Items"}</span>
              </div>
              <button onClick={closeCart} className="w-9 h-9 flex items-center justify-center text-jet/40 hover:text-jet transition-colors">
                <X size={16} />
              </button>
            </div>

            {state.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                <div className="w-16 h-16 rounded-full bg-ivory flex items-center justify-center">
                  <ShoppingBag size={24} className="text-jet/20" />
                </div>
                <p className="font-poppins text-sm text-jet/50 text-center">Your cart is empty</p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="h-10 px-6 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-all duration-300 flex items-center"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b border-jet/5">
                      <Link href={`/shop/${item.slug}`} onClick={closeCart} className="shrink-0 w-20 aspect-[3/4] overflow-hidden bg-ivory relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        {item.isPreOrder && (
                          <span className="absolute top-1 left-1 bg-gold text-jet text-[7px] font-poppins uppercase tracking-luxe px-1.5 py-0.5">Pre-Order</span>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.slug}`} onClick={closeCart} className="font-poppins text-xs text-jet font-medium hover:text-gold transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <p className="text-[10px] font-poppins text-jet/40 mt-0.5">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.size && item.color && <span> &bull; </span>}
                          {item.color && <span>{item.color}</span>}
                        </p>
                        {item.isPreOrder && item.preOrderReleaseDate && (
                          <p className="text-[9px] font-poppins text-gold mt-0.5">Available {new Date(item.preOrderReleaseDate).toLocaleDateString()}</p>
                        )}
                        <p className="font-poppins text-sm font-medium text-jet mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex border border-jet/10">
                            <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-jet/40 hover:text-jet transition-colors">
                              <Minus size={10} />
                            </button>
                            <span className="w-8 h-7 flex items-center justify-center text-[11px] font-poppins border-x border-jet/10">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-jet/40 hover:text-jet transition-colors">
                              <Plus size={10} />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-jet/20 hover:text-burgundy transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-jet/5 px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-poppins text-xs text-jet/50 uppercase tracking-luxe">Subtotal</span>
                    <span className="font-poppins text-base font-medium text-jet">{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-[10px] font-poppins text-jet/30">Cash or Transfer on Delivery</p>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full h-12 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe flex items-center justify-center hover:bg-gold hover:text-jet transition-all duration-300"
                  >
                    Checkout
                  </Link>
                  <button onClick={closeCart} className="block w-full text-center text-[10px] font-poppins text-jet/40 hover:text-jet transition-colors uppercase tracking-luxe">
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}