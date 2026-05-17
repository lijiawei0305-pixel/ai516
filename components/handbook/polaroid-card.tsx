import { cn } from "@/lib/utils";
import { Tape } from "@/components/handbook/tape";

type PolaroidCardProps = {
  className?: string;
  caption?: string;
  children?: React.ReactNode;
};

export function PolaroidCard({ className, caption, children }: PolaroidCardProps) {
  return (
    <figure className={cn("relative rotate-[-5deg] bg-cream p-3 pb-8 shadow-paper", className)}>
      <Tape className="-top-3 left-8 h-6 w-20 rotate-[-12deg]" />
      <div className="aspect-square overflow-hidden bg-parchment shadow-insetPaper">{children}</div>
      {caption ? (
        <figcaption className="absolute bottom-2 left-4 font-serif text-base text-coffee/70">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
