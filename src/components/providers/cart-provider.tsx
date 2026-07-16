"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

const STORAGE_KEY = "ysi_cart";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  slug: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QTY"; payload: { id: string; qty: number } }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  toggleCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.payload };
    case "ADD_ITEM": {
      const key = `${action.payload.id}_${action.payload.size || ""}_${action.payload.color || ""}`
      const existing = state.items.find((i) => i.id === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === key ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, id: key, quantity: action.payload.quantity || 1 }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: Math.max(0, action.payload.qty) } : i
        ).filter((i) => i.quantity > 0),
      };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });
  const { user } = useAuth()
  const isLoggedIn = !!user
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hydrated = useRef(false)

  const syncToSupabase = useCallback(async (items: CartItem[]) => {
    if (!user?.id) return
    try {
      const { error } = await supabase.from("carts").upsert(
        { user_id: user.id, items },
        { onConflict: "user_id", ignoreDuplicates: false }
      )
      if (error) console.error("Cart sync error:", error.message)
    } catch {}
  }, [user])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch {}
    hydrated.current = true
  }, []);

  useEffect(() => {
    if (!hydrated.current) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));

    if (isLoggedIn) {
      if (syncTimer.current) clearTimeout(syncTimer.current)
      syncTimer.current = setTimeout(() => syncToSupabase(state.items), 1000)
    }
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current) }
  }, [state.items, isLoggedIn, syncToSupabase]);

  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    supabase.from("carts").select("items").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!data?.items) return
      const remoteItems = (data.items as CartItem[]) || []
      if (remoteItems.length === 0) return
      const localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CartItem[]
      if (localItems.length === 0) {
        dispatch({ type: "HYDRATE", payload: remoteItems })
      }
    })
  }, [isLoggedIn, user])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) =>
    dispatch({ type: "ADD_ITEM", payload: item as CartItem });
  const removeItem = (id: string) => dispatch({ type: "REMOVE_ITEM", payload: id });
  const updateQty = (id: string, qty: number) => dispatch({ type: "UPDATE_QTY", payload: { id, qty } });
  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQty, toggleCart, closeCart, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}