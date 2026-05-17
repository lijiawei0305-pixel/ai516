import { cn } from "@/lib/utils";

type StickerTagProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "sage" | "parchment" | "rose" | "blue";
  icon?: React.ReactNode;
};

const toneClasses = {
  sage: "bg-sage/78 text-cream",
  parchment: "bg-parchment text-coffee",
  rose: "bg-[#e9bbb1] text-coffee",
  blue: "bg-old-blue-gray/28 text-coffee"
};

export function StickerTag({
  children,
  className,
  tone = "parchment",
  icon
}: StickerTagProps) {
  return (
    <span
      className={cn(
        "torn-edge paper-grain inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium shadow-sticker",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
