"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-poppins text-sm uppercase tracking-luxe-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-jet text-cream hover:bg-gold hover:text-jet shadow-soft",
        gold: "bg-gold text-jet hover:bg-gold-light shadow-soft",
        outline:
          "border border-jet/30 text-jet bg-transparent hover:bg-jet hover:text-cream",
        "outline-gold":
          "border border-gold/60 text-gold bg-transparent hover:bg-gold hover:text-jet",
        ghost: "text-jet hover:bg-jet/5",
        light:
          "bg-cream text-jet hover:bg-gold hover:text-jet shadow-soft",
        link: "text-jet underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-10 px-5 text-xs",
        md: "h-12 px-7",
        lg: "h-14 px-10 text-sm",
        xl: "h-16 px-12 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
