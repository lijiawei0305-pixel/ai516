import { cn } from "@/lib/utils";

type TapeProps = {
  className?: string;
  variant?: "plain" | "cross" | "strip";
};

export function Tape({ className, variant = "plain" }: TapeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-20 block h-7 w-24 rotate-[-8deg] bg-tape shadow-[0_2px_7px_rgba(74,45,21,0.16)] backdrop-blur-[1px]",
        "before:absolute before:inset-0 before:bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.18)_0_4px,transparent_4px_9px)] before:content-['']",
        variant === "cross" && "after:absolute after:left-7 after:top-[-10px] after:h-7 after:w-20 after:rotate-[72deg] after:bg-tape after:content-['']",
        variant === "strip" && "w-16 rotate-6",
        className
      )}
    />
  );
}
