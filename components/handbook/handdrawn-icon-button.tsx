"use client";

import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type HanddrawnIconButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  icon: React.ReactNode;
  label: string;
  variant?: "paper" | "circle";
};

export function HanddrawnIconButton({
  icon,
  label,
  className,
  variant = "paper",
  type = "button",
  ...props
}: HanddrawnIconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, rotate: 2 }}
      whileTap={{ scale: 0.92, rotate: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "paper-grain inline-flex h-12 w-12 items-center justify-center text-coffee shadow-sticker outline-none transition-shadow duration-200 hover:shadow-paper",
        "focus-visible:ring-2 focus-visible:ring-warm-orange/50",
        variant === "paper" ? "torn-edge bg-parchment" : "rounded-full border border-coffee/12 bg-cream",
        className
      )}
      {...props}
    >
      {icon}
    </motion.button>
  );
}
