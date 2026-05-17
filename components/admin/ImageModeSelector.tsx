"use client";

import { cn } from "@/lib/utils";
import type { AdminLlmImageMode } from "@/lib/schemas/adminLlmConfig";

type ImageModeSelectorProps = {
  value: AdminLlmImageMode;
  onChange: (value: AdminLlmImageMode) => void;
};

const options: Array<{
  value: AdminLlmImageMode;
  label: string;
  description: string;
}> = [
  {
    value: "images_api",
    label: "images_api",
    description: "走 /images/generations"
  },
  {
    value: "chat_completions_image_model",
    label: "chat_completions_image_model",
    description: "走 /chat/completions 图像模型"
  }
];

export function ImageModeSelector({ value, onChange }: ImageModeSelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "torn-edge paper-grain text-left shadow-sticker transition active:translate-y-0.5",
              "min-h-24 rounded-[3px] px-4 py-3",
              selected ? "bg-sage text-cream" : "bg-parchment text-coffee"
            )}
            aria-pressed={selected}
          >
            <div className="soft-title text-lg">{option.label}</div>
            <p className="mt-1 font-serif text-sm leading-6 opacity-80">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

