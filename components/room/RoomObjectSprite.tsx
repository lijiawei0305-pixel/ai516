"use client";

import { useState } from "react";
import { ImageOff, Sparkle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { MiniRoomLayer, MiniRoomObject } from "@/lib/adapters/roomPublicDataAdapter";
import { cn } from "@/lib/utils";

type RoomObjectSpriteProps = {
  object: MiniRoomObject;
  index: number;
  selected: boolean;
  discovered: boolean;
  zIndex: number;
  onSelect: (object: MiniRoomObject) => void;
};

function scaleFromDepth(object: MiniRoomObject) {
  const depth = typeof object.position.z === "number" ? object.position.z : 16;
  const yScale = 0.9 + Math.max(0, Math.min(100, object.position.y)) / 560;

  return object.scale || object.render.scale || yScale + Math.min(0.08, depth / 500);
}

function isPlantLikeObject(object: MiniRoomObject) {
  const haystack = [
    object.id,
    object.name,
    object.keyword,
    object.render.style
  ].join(" ");

  return /plant|叶|花|草|芽|盆栽/i.test(haystack);
}

export function RoomObjectSprite({
  object,
  index,
  selected,
  discovered,
  zIndex,
  onSelect
}: RoomObjectSpriteProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [raised, setRaised] = useState(false);
  const reduceMotion = useReducedMotion();
  const scale = scaleFromDepth(object);
  const width = object.render.width * scale;
  const height = object.render.height * scale;
  const layers = object.render.layers ?? [];
  const hasLayers = layers.length > 0;
  const hasImage = Boolean(
    (object.assetUrl || hasLayers) && !imageFailed
  );
  const shadow = object.shadow;
  const isRaised = selected || raised;
  const plantLike = isPlantLikeObject(object);
  const idleAnimate = reduceMotion
    ? undefined
    : {
        scale: [1, 1.005, 0.995, 1],
        rotate: plantLike ? [0, 1.5, -1.5, 0] : 0
      };

  return (
    <motion.button
      type="button"
      aria-label={`查看线索：${object.name}`}
      onClick={() => onSelect(object)}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: selected ? -6 : 0, scale: 1 }}
      whileHover={{ y: -5 }}
      whileFocus={{ y: -5 }}
      whileTap={{ y: -2, scale: 0.98 }}
      onHoverStart={() => setRaised(true)}
      onHoverEnd={() => setRaised(false)}
      onFocus={() => setRaised(true)}
      onBlur={() => setRaised(false)}
      transition={{ type: "spring", stiffness: 270, damping: 24 }}
      className={cn(
        "group absolute outline-none",
        "min-h-[56px] min-w-[56px] sm:min-h-[48px] sm:min-w-[48px]"
      )}
      style={{
        left: `${object.position.x}%`,
        top: `${object.position.y}%`,
        zIndex,
        x: `-${typeof object.anchor === "object" ? object.anchor.x * 100 : object.anchor === "top-left" ? 0 : 50}%`,
        y: `-${typeof object.anchor === "object" ? object.anchor.y * 100 : object.anchor === "center" ? 50 : object.anchor === "top-left" ? 0 : 100}%`,
        width,
        height,
        padding: 10,
        touchAction: "manipulation"
      }}
    >
      {shadow.enabled ? (
        <motion.span
          className="pointer-events-none absolute left-1/2 top-full rounded-full bg-[#2d1b0f]"
          style={{
            width: shadow.width * scale,
            height: shadow.height * scale
          }}
          animate={{
            opacity: isRaised ? Math.min(0.22, shadow.opacity * 0.72) : shadow.opacity,
            x: "-50%",
            y: shadow.offsetY + (isRaised ? 4 : 0),
            scaleX: 1.08 + object.position.y / 360 + (isRaised ? 0.18 : 0),
            scaleY: isRaised ? 1.1 : 1,
            filter: `blur(${shadow.blur + (isRaised ? 2 : 0)}px)`
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        />
      ) : null}

      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-[58%] rounded-full opacity-0 transition",
          "bg-[#ffd985]/18 blur-[1px] shadow-[0_0_24px_rgba(255,211,120,0.86),0_0_0_2px_rgba(255,245,223,0.6)]",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
          selected && "opacity-100"
        )}
        style={{
          width: Math.max(width * 0.82, 58),
          height: Math.max(height * 0.72, 50),
          transform: "translate(-50%, -50%)"
        }}
      />

      <motion.span
        className="pointer-events-none absolute inset-0"
        animate={idleAnimate}
        transition={{ duration: plantLike ? 4.8 : 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {hasImage && hasLayers ? (
          <ObjectLayerStack
            layers={layers}
            alt={object.name}
            discovered={discovered}
            selected={selected}
            reduceMotion={reduceMotion}
            onAnyError={() => setImageFailed(true)}
          />
        ) : hasImage ? (
          <img
            src={object.assetUrl ?? ""}
            alt={object.name}
            draggable={false}
            className={cn(
              "pointer-events-none absolute bottom-0 left-1/2 max-h-full max-w-full -translate-x-1/2 object-contain transition",
              "drop-shadow-[var(--room-sprite-shadow)]",
              "[filter:drop-shadow(var(--room-sprite-shadow))_drop-shadow(var(--room-sprite-shadow-soft))_drop-shadow(var(--room-rim-x)_var(--room-rim-y)_0_var(--room-rim-color))]",
              discovered ? "brightness-105" : "brightness-95",
              selected && "brightness-110"
            )}
            onError={(event) => {
              event.currentTarget.style.display = "none";
              setImageFailed(true);
            }}
          />
        ) : (
          <span
            className="torn-edge paper-grain absolute bottom-1 left-1/2 flex h-20 w-16 -translate-x-1/2 items-center justify-center bg-cream/88 text-coffee/55 shadow-[var(--room-sprite-shadow),var(--room-sprite-shadow-soft),inset_-8px_-10px_0_rgba(138,91,54,0.12)]"
            style={{
              clipPath: "polygon(18% 8%, 88% 0, 100% 76%, 46% 100%, 0 72%)"
            }}
          >
            <span className="absolute bottom-0 left-1/2 h-3 w-11 -translate-x-1/2 rounded-full bg-[#2d1b0f]/16 blur-[4px]" />
            <ImageOff className="relative h-6 w-6" strokeWidth={1.5} />
            <Sparkle className="absolute right-2 top-2 h-3 w-3 text-warm-orange/65" strokeWidth={1.5} />
          </span>
        )}
      </motion.span>

      {shadow.enabled && hasImage ? (
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
            src={object.assetUrl ?? ""}
            alt=""
            draggable={false}
            className="absolute bottom-0 left-1/2 max-h-full max-w-full -translate-x-1/2 object-contain opacity-30 blur-[2px]"
          />
        </span>
      ) : null}

      <span
        className={cn(
          "absolute -left-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-cream/95",
          "bg-warm-orange/54 text-center soft-title text-lg text-cream shadow-[0_0_18px_rgba(255,214,126,0.95)]",
          selected && "bg-warm-orange/78 shadow-[0_0_26px_rgba(255,214,126,1)]",
          discovered && "border-warm-orange bg-cream text-warm-orange"
        )}
      >
        {index + 1}
      </span>
    </motion.button>
  );
}

const LAYER_DRAW_ORDER: Record<MiniRoomLayer["role"], number> = {
  back: 0,
  mid: 1,
  front: 2
};

function ObjectLayerStack({
  layers,
  alt,
  discovered,
  selected,
  reduceMotion,
  onAnyError
}: {
  layers: MiniRoomLayer[];
  alt: string;
  discovered: boolean;
  selected: boolean;
  reduceMotion: boolean | null;
  onAnyError: () => void;
}) {
  const sorted = [...layers].sort(
    (a, b) => LAYER_DRAW_ORDER[a.role] - LAYER_DRAW_ORDER[b.role]
  );

  return (
    <>
      {sorted.map((layer) => {
        const depthScale =
          layer.role === "back" ? 0.94 : layer.role === "front" ? 1.05 : 1;
        const verticalOffset =
          layer.role === "back" ? -3 : layer.role === "front" ? 2 : 0;
        const swayDuration =
          layer.role === "front" ? 4.4 : layer.role === "back" ? 5.8 : 5;
        const sway = layer.swayAmplitude;
        const layerAnimate =
          reduceMotion || sway <= 0
            ? undefined
            : {
                rotate: [0, sway, -sway, 0],
                y: [0, -sway * 0.4, sway * 0.4, 0]
              };

        return (
          <motion.img
            key={layer.role}
            src={layer.assetUrl}
            alt={alt}
            draggable={false}
            animate={layerAnimate}
            transition={{
              duration: swayDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "pointer-events-none absolute bottom-0 left-1/2 max-h-full max-w-full -translate-x-1/2 object-contain transition",
              "[filter:drop-shadow(var(--room-sprite-shadow))_drop-shadow(var(--room-sprite-shadow-soft))_drop-shadow(var(--room-rim-x)_var(--room-rim-y)_0_var(--room-rim-color))]",
              discovered ? "brightness-105" : "brightness-95",
              selected && "brightness-110"
            )}
            style={{
              translateY: verticalOffset,
              scale: depthScale,
              zIndex: LAYER_DRAW_ORDER[layer.role]
            }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
              onAnyError();
            }}
          />
        );
      })}
    </>
  );
}
