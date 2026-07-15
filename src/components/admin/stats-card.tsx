"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  className?: string;
}

export function StatsCard({ label, value, change, icon, className }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-cream border border-jet/5 p-6", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/40 mb-1">
            {label}
          </p>
          <p className="font-display text-2xl lg:text-3xl text-jet font-bold">
            {value}
          </p>
          {change !== undefined && (
            <p
              className={cn(
                "text-xs font-poppins mt-1",
                isPositive ? "text-emerald" : "text-burgundy"
              )}
            >
              {isPositive ? "+" : ""}
              {change}% from last month
            </p>
          )}
        </div>
        <span className={cn("text-jet/30", "w-10 h-10 rounded-lg bg-jet/5 flex items-center justify-center shrink-0")}>
          {icon}
        </span>
      </div>
    </motion.div>
  );
}
