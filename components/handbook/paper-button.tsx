"use client";

import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { Tape } from "@/components/handbook/tape";

type PaperButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: React.ReactNode;
  variant?: "sage" | "paper" | "parchment" | "brick";
  icon?: React.ReactNode;
  withTape?: boolean;
};

const variantClasses = {
  sage: "bg-sage text-cream",
  paper: "bg-cream text-coffee",
  parchment: "bg-parchment text-coffee",
  brick: "bg-brick-red text-cream"
};

export function PaperButton({
  className,
  children,
  variant = "sage",
  icon,
  withTape = false,
  type = "button",
  ...props
}: PaperButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.965, y: 2, rotate: -0.4 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      type={type}
      className={cn(
        "torn-edge paper-grain relative inline-flex min-h-14 w-full items-center justify-center gap-3 overflow-visible px-7 py-4 text-center soft-title text-[28px] leading-none shadow-sticker outline-none",
        "focus-visible:ring-2 focus-visible:ring-warm-orange/50 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {withTape ? <Tape className="-right-1 -top-3 h-6 w-16 rotate-[16deg]" /> : null}
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}
