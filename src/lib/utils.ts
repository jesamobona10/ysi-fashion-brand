import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "NGN") {
  const symbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : "£";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
