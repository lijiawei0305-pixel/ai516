import { cn } from "@/lib/utils";
import { Tape } from "@/components/handbook/tape";

type TornPaperCardProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "cream" | "parchment" | "sage" | "rose" | "blue";
  tape?: "none" | "top" | "corner";
};

const toneClasses = {
  cream: "bg-cream",
  parchment: "bg-parchment",
  sage: "bg-sage/24",
  rose: "bg-[#e8b6a7]/65",
  blue: "bg-old-blue-gray/20"
};

export function TornPaperCard({
  children,
  className,
  tone = "cream",
  tape = "none"
}: TornPaperCardProps) {
  return (
    <article
      className={cn(
        "torn-edge paper-grain relative overflow-visible p-4 text-coffee shadow-sticker",
        toneClasses[tone],
        className
      )}
    >
      {tape === "top" ? <Tape className="left-1/2 top-[-13px] -translate-x-1/2 rotate-[-2deg]" /> : null}
      {tape === "corner" ? <Tape className="-right-2 -top-3 h-6 w-16 rotate-[16deg]" /> : null}
      {children}
    </article>
  );
}
