"use client";

import { useState } from "react";
import { Cat, Dog } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { MiniRoomPet } from "@/lib/adapters/roomPublicDataAdapter";
import { cn } from "@/lib/utils";

type PetSpriteProps = {
  pet: MiniRoomPet;
  zIndex?: number;
  onSelect?: () => void;
};

export function PetSprite({ pet, zIndex, onSelect }: PetSpriteProps) {
  const [raised, setRaised] = useState(false);
  const reduceMotion = useReducedMotion();
  const Icon = pet.type === "dog" ? Dog : Cat;
  const width = 72 * pet.scale;
  const height = 78 * pet.scale;
  const shadow = pet.shadow;
  const idleAnimate = reduceMotion
    ? undefined
    : {
        scale: [1, 1.006, 0.996, 1],
        rotate: pet.type === "dog" ? [0, -1, 1, 0] : [0, 1, -1, 0]
      };

  return (
    <motion.button
      type="button"
      aria-label={`和${pet.name}说话`}
      onClick={onSelect}
      whileHover={{ y: -5, rotate: -2 }}
      whileTap={{ y: -1, scale: 0.96 }}
      onHoverStart={() => setRaised(true)}
      onHoverEnd={() => setRaised(false)}
      onFocus={() => setRaised(true)}
      onBlur={() => setRaised(false)}
      className={cn(
        "group absolute flex items-center justify-center outline-none",
        "focus-visible:ring-2 focus-visible:ring-warm-orange/70"
      )}
      style={{
        left: `${pet.position.x}%`,
        top: `${pet.position.y}%`,
        zIndex: zIndex ?? pet.position.layer,
        x: `-${typeof pet.anchor === "object" ? pet.anchor.x * 100 : pet.anchor === "top-left" ? 0 : 50}%`,
        y: `-${typeof pet.anchor === "object" ? pet.anchor.y * 100 : pet.anchor === "center" ? 50 : pet.anchor === "top-left" ? 0 : 100}%`,
        width,
        height
      }}
    >
      {shadow.enabled ? (
        <motion.span
          className="absolute left-1/2 top-full rounded-full bg-[#2d1b0f]"
          style={{
            width: shadow.width * pet.scale,
            height: shadow.height * pet.scale
          }}
          animate={{
            opacity: raised ? Math.min(0.22, shadow.opacity * 0.72) : shadow.opacity,
            x: "-50%",
            y: shadow.offsetY + (raised ? 4 : 0),
            scaleX: raised ? 1.28 : 1.16,
            scaleY: raised ? 1.08 : 1,
            filter: `blur(${shadow.blur + (raised ? 2 : 0)}px)`
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        />
      ) : null}
      <span className="absolute left-1/2 top-[58%] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd985]/18 opacity-0 blur-[1px] shadow-[0_0_24px_rgba(255,211,120,0.86)] transition group-hover:opacity-100 group-focus-visible:opacity-100" />
      <motion.span
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={idleAnimate}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {pet.assetUrl ? (
          <img
            src={pet.assetUrl}
            alt={pet.name}
            draggable={false}
            className="pointer-events-none absolute bottom-0 left-1/2 max-h-full max-w-full -translate-x-1/2 object-contain [filter:drop-shadow(var(--room-sprite-shadow))_drop-shadow(var(--room-sprite-shadow-soft))_drop-shadow(var(--room-rim-x)_var(--room-rim-y)_0_var(--room-rim-color))] transition group-hover:-translate-y-1"
          />
        ) : (
          <>
            <span className="absolute inset-1 rounded-full bg-cream/78 shadow-[0_0_18px_rgba(255,215,123,0.74)]" />
            <span className="torn-edge paper-grain relative flex h-12 w-12 items-center justify-center bg-parchment text-coffee shadow-sticker transition group-hover:-translate-y-1">
              <Icon className="h-7 w-7" strokeWidth={1.5} />
            </span>
          </>
        )}
      </motion.span>

      {shadow.enabled && pet.assetUrl ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2"
          style={{
            width,
            height: height * 0.55,
            transform: "translate(-50%, -2%) scaleY(-1)",
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)"
          }}
        >
          <img
            src={pet.assetUrl}
            alt=""
            draggable={false}
            className="absolute bottom-0 left-1/2 max-h-full max-w-full -translate-x-1/2 object-contain opacity-30 blur-[2px]"
          />
        </span>
      ) : null}
    </motion.button>
  );
}
