import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-poppins uppercase tracking-luxe-sm text-[10px] font-medium",
  {
    variants: {
      variant: {
        default: "bg-jet text-cream px-3 py-1",
        gold: "bg-gold/15 text-gold px-3 py-1",
        outline: "border border-jet/20 text-jet px-3 py-1",
        emerald: "bg-emerald/10 text-emerald px-3 py-1",
        burgundy: "bg-burgundy/10 text-burgundy px-3 py-1",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
